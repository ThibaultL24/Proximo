require "test_helper"
require "minitest/mock"

class SocialWordpressClientTest < ActiveSupport::TestCase
  FakeResponse = Struct.new(:code, :body)
  class FakeResolver
    def self.getaddresses(_host)
      ["1.1.1.1"]
    end
  end
  class LocalResolver
    def self.getaddresses(_host)
      ["127.0.0.1"]
    end
  end
  class FakeHttp
    attr_accessor :ipaddr, :use_ssl, :verify_mode, :open_timeout, :read_timeout, :write_timeout
    attr_reader :last_request

    def initialize(response)
      @response = response
    end

    def request(req)
      @last_request = req
      @response
    end
  end

  test "rejects non-https, local domains, custom ports and URL credentials" do
    ["http://commerce.fr", "https://localhost", "https://192.168.1.12",
     "https://commerce.local", "https://commerce.fr:8443",
     "https://user:password@commerce.fr", "https://commerce.fr/private"].each do |url|
      assert_raises(Social::WordpressClient::Error) do
        Social::WordpressClient.new(site_url: url, username: "éditeur", application_password: "secret")
      end
    end
  end

  test "rejects private DNS addresses before making an HTTP request" do
    client = Social::WordpressClient.new(
      site_url: "https://commerce.fr", username: "editor",
      application_password: "app-password", resolver: LocalResolver
    )
    assert_raises(Social::WordpressClient::Error) { client.verify! }
  end

  test "verifies WordPress user without using main password or redirects" do
    fake = FakeHttp.new(FakeResponse.new("200", '{"id":12,"name":"Rédacteur"}'))
    client = Social::WordpressClient.new(
      site_url: "https://commerce.fr/", username: "editor",
      application_password: "app-password", resolver: FakeResolver
    )
    Net::HTTP.stub(:new, fake) do
      verified = client.verify!
      assert_equal 12, verified.fetch("id")
    end
    assert_equal "https://commerce.fr", client.site_url
    assert_equal "1.1.1.1", fake.ipaddr
    assert_equal true, fake.use_ssl
    assert_equal OpenSSL::SSL::VERIFY_PEER, fake.verify_mode
    assert_equal "/wp-json/wp/v2/users/me?context=edit", fake.last_request.path
    assert_match(/Basic /, fake.last_request["Authorization"])
  end

  test "uses official POST with publish status only after explicit request" do
    fake = FakeHttp.new(FakeResponse.new("201", '{"id":45,"status":"publish","link":"https://commerce.fr/p/45"}'))
    client = Social::WordpressClient.new(
      site_url: "https://commerce.fr", username: "editor",
      application_password: "app-password", resolver: FakeResolver
    )
    Net::HTTP.stub(:new, fake) do
      result = client.publish!(title: "Marché local", html: "<p>Une annonce</p>")
      assert_equal 45, result.fetch("id")
    end
    assert_equal "/wp-json/wp/v2/posts", fake.last_request.path
    payload = JSON.parse(fake.last_request.body)
    assert_equal "publish", payload.fetch("status")
    assert_equal "Marché local", payload.fetch("title")
  end

  test "refuses a redirect, unauthorized credentials and unconfirmed publishing" do
    resolver = FakeResolver
    client = Social::WordpressClient.new(
      site_url: "https://commerce.fr", username: "editor",
      application_password: "app-password", resolver: resolver
    )
    [
      FakeResponse.new("403", "{}"),
      FakeResponse.new("201", '{"id":7,"status":"draft"}')
    ].each do |response|
      fake = FakeHttp.new(response)
      Net::HTTP.stub(:new, fake) do
        assert_raises(Social::WordpressClient::Error) do
          client.publish!(title: "Article", html: "<p>Texte</p>")
        end
      end
    end
  end
end
