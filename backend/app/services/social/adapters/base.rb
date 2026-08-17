# app/services/social/adapters/base.rb
require "net/http"
require "uri"
require "json"
require "stringio"

module Social
  module Adapters
    class Base
      Result = Struct.new(:status, :external_post_id, :error_message, keyword_init: true)

      def self.publish(account:, body:, image_url: nil, image_io: nil, image_filename: nil, image_content_type: nil)
        new(
          account:,
          body:,
          image_url:,
          image_io:,
          image_filename:,
          image_content_type:
        ).publish
      end

      def initialize(account:, body:, image_url: nil, image_io: nil, image_filename: nil, image_content_type: nil)
        @account = account
        @body = body
        @image_url = image_url
        @image_io = image_io
        @image_filename = image_filename
        @image_content_type = image_content_type
      end

      def publish
        raise NotImplementedError
      end

      private

      attr_reader :account, :body, :image_url, :image_io, :image_filename, :image_content_type

      def demo_result
        Result.new(
          status: :published,
          external_post_id: "demo-#{account.provider}-#{SecureRandom.hex(4)}",
          error_message: nil
        )
      end

      def failed(message)
        Result.new(status: :failed, external_post_id: nil, error_message: message.to_s.truncate(500))
      end

      def use_demo?
        account.demo? || account.access_token.blank? || !Social::Config.configured?(account.provider)
      end

      def public_image_url?
        image_url.present? && image_url.start_with?("https://") && !image_url.include?("localhost") && !image_url.include?("127.0.0.1")
      end

      def post_json(url, payload, headers: {})
        uri = URI(url)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        req = Net::HTTP::Post.new(uri)
        req["Content-Type"] = "application/json"
        headers.each { |k, v| req[k] = v }
        req.body = JSON.generate(payload)
        parse_http_response(http.request(req))
      end

      def post_form(url, form)
        uri = URI(url)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        req = Net::HTTP::Post.new(uri)
        req.set_form_data(form)
        parse_http_response(http.request(req))
      end

      def post_multipart(url, fields:, file_field:, filename:, content_type:, io:)
        uri = URI(url)
        boundary = "----ProxImo#{SecureRandom.hex(12)}"
        chunks = []

        fields.each do |key, value|
          chunks << "--#{boundary}\r\n"
          chunks << "Content-Disposition: form-data; name=\"#{key}\"\r\n\r\n"
          chunks << "#{value}\r\n"
        end

        file_bytes = io.respond_to?(:read) ? io.read : io.to_s
        io.rewind if io.respond_to?(:rewind)
        file_bytes = file_bytes.to_s.b

        chunks << "--#{boundary}\r\n"
        chunks << "Content-Disposition: form-data; name=\"#{file_field}\"; filename=\"#{filename}\"\r\n"
        chunks << "Content-Type: #{content_type}\r\n\r\n"
        body = chunks.join.b
        body << file_bytes
        body << "\r\n--#{boundary}--\r\n".b

        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        req = Net::HTTP::Post.new(uri)
        req["Content-Type"] = "multipart/form-data; boundary=#{boundary}"
        req.body = body
        parse_http_response(http.request(req))
      end

      def parse_http_response(response)
        data = JSON.parse(response.body.presence || "{}")
        raise(data.dig("error", "message") || data["message"] || response.message) unless response.is_a?(Net::HTTPSuccess)

        data
      end
    end
  end
end
