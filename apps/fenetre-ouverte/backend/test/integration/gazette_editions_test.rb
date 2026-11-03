require "test_helper"

class GazetteEditionsTest < ActionDispatch::IntegrationTest
  setup do
    @agency = create_agency!(slug: "gazette-#{SecureRandom.hex(5)}")
    @foreign_agency = create_agency!(slug: "foreign-gazette-#{SecureRandom.hex(5)}")
    @editor = create_user!(agency: @agency, role: :admin)
    @outsider = create_user!(agency: @foreign_agency, role: :admin)
    @author = @editor
    @article = Article.create!(
      agency: @agency, author: @author, title: "Portrait d'un artisan",
      slug: "portrait-#{SecureRandom.hex(4)}", body: "Texte original",
      excerpt: "Présentation", category: :merchant_spotlight, status: :draft
    )
    @foreign_article = Article.create!(
      agency: @foreign_agency, author: @outsider, title: "Article privé",
      slug: "foreign-#{SecureRandom.hex(4)}", body: "Hors territoire",
      category: :local_news, status: :draft
    )
    @url = "/api/v1/admin/gazette_editions"
  end

  test "editor saves a draft and can load it from a separate API request" do
    post @url, headers: auth(@editor), params: { gazette_edition: payload }
    assert_response :created
    id = response.parsed_body.fetch("id")
    assert_equal "draft", response.parsed_body.fetch("status")

    get "#{@url}/#{id}", headers: auth(@editor)
    assert_response :success
    assert_equal "Portrait d'artisan", response.parsed_body.fetch("pages").first.fetch("rubric")
    assert_equal "de Martine et Jean-Michel", response.parsed_body.fetch("settings").fetch("subtitle")
  end

  test "foreign territory cannot see or mutate another publisher's edition" do
    post @url, headers: auth(@editor), params: { gazette_edition: payload }
    id = response.parsed_body.fetch("id")

    get "#{@url}/#{id}", headers: auth(@outsider)
    assert_response :not_found
    patch "#{@url}/#{id}", headers: auth(@outsider), params: {
      gazette_edition: payload.merge(lock_version: 0)
    }
    assert_response :not_found

    get @url, headers: auth(@outsider)
    assert_response :success
    assert_equal [], response.parsed_body
  end

  test "anonymous visitors cannot read editorial drafts" do
    get @url
    assert_response :unauthorized
  end

  test "an article from another publisher cannot be included" do
    foreign = payload
    foreign[:pages] = [{ id: 1, template: "portrait", articleId: @foreign_article.id, rubric: "Privé", note: "" }]
    post @url, headers: auth(@editor), params: { gazette_edition: foreign }
    assert_response :unprocessable_entity
  end

  test "published page content is snapshotted and cannot be silently rewritten" do
    post @url, headers: auth(@editor), params: { gazette_edition: payload }
    assert_response :created
    edition = response.parsed_body

    patch "#{@url}/#{edition.fetch("id")}/publish",
      headers: auth(@editor), params: { lock_version: edition.fetch("lock_version") }
    assert_response :success
    assert_equal "published", response.parsed_body.fetch("status")
    assert_equal "Texte original", response.parsed_body.fetch("pages").first.fetch("article_snapshot").fetch("body")
    revision = response.parsed_body.fetch("lock_version")

    @article.update!(body: "Nouveau texte après publication")
    get "#{@url}/#{edition.fetch("id")}", headers: auth(@editor)
    assert_response :success
    assert_equal "Texte original", response.parsed_body.fetch("pages").first.fetch("article_snapshot").fetch("body")

    patch "#{@url}/#{edition.fetch("id")}",
      headers: auth(@editor), params: { gazette_edition: payload.merge(lock_version: revision) }
    assert_response :conflict

    patch "#{@url}/#{edition.fetch("id")}/archive",
      headers: auth(@editor), params: { lock_version: revision }
    assert_response :success
    assert_equal "archived", response.parsed_body.fetch("status")
  end

  test "editing requires the latest revision" do
    post @url, headers: auth(@editor), params: { gazette_edition: payload }
    edition = response.parsed_body
    patch "#{@url}/#{edition.fetch("id")}",
      headers: auth(@editor), params: {
        gazette_edition: payload.merge(edition_label: "Novembre 2026", lock_version: 0)
      }
    assert_response :success
    assert_equal 1, response.parsed_body.fetch("lock_version")

    patch "#{@url}/#{edition.fetch("id")}",
      headers: auth(@editor), params: { gazette_edition: payload.merge(lock_version: 0) }
    assert_response :conflict
  end

  test "publication rejects pages missing an article" do
    input = payload
    input[:pages] = [{ id: 1, template: "portrait", articleId: nil, rubric: "En attente", note: "" }]
    post @url, headers: auth(@editor), params: { gazette_edition: input }
    assert_response :created
    edition = response.parsed_body

    patch "#{@url}/#{edition.fetch("id")}/publish",
      headers: auth(@editor), params: { lock_version: edition.fetch("lock_version") }
    assert_response :unprocessable_entity
    assert GazetteEdition.find(edition.fetch("id")).draft?
  end


  test "public catalog only shows published editions and not foreign drafts" do
    post @url, headers: auth(@editor), params: { gazette_edition: payload }
    assert_response :created
    edition = response.parsed_body

    get "/api/v1/public/gazette_editions"
    assert_response :success
    assert_equal [], response.parsed_body

    get "/api/v1/public/gazette_editions/#{edition.fetch("id")}"
    assert_response :not_found

    patch "#{@url}/#{edition.fetch("id")}/publish",
      headers: auth(@editor), params: { lock_version: edition.fetch("lock_version") }
    assert_response :success

    # The public catalog belongs to DEFAULT_AGENCY_SLUG, not every publisher.
    get "/api/v1/public/gazette_editions"
    assert_response :success
    assert_equal [], response.parsed_body

    previous_slug = ENV["DEFAULT_AGENCY_SLUG"]
    begin
      ENV["DEFAULT_AGENCY_SLUG"] = @agency.slug
      get "/api/v1/public/gazette_editions"
      assert_response :success
      assert_equal [edition.fetch("id")], response.parsed_body.map { |row| row.fetch("id") }

      get "/api/v1/public/gazette_editions/#{edition.fetch("id")}"
      assert_response :success
      assert_equal "Texte original", response.parsed_body.fetch("pages").first.fetch("article_snapshot").fetch("body")
    ensure
      previous_slug ? ENV["DEFAULT_AGENCY_SLUG"] = previous_slug : ENV.delete("DEFAULT_AGENCY_SLUG")
    end
  end

  test "edition assets are stored with an editor and cannot be overwritten by another agency" do
    post @url, headers: auth(@editor), params: { gazette_edition: payload }
    assert_response :created
    edition = response.parsed_body

    require "tempfile"
    require "base64"
    image = Base64.decode64(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+iL9sAAAAASUVORK5CYII="
    )
    Tempfile.create(["gazette-qr", ".png"]) do |temp|
      temp.binmode
      temp.write(image)
      temp.flush

      upload = Rack::Test::UploadedFile.new(temp.path, "image/png")
      post "#{@url}/#{edition.fetch("id")}/upload_asset",
        headers: auth(@outsider),
        params: { lock_version: edition.fetch("lock_version"), slot: "headerLogo", file: upload }
      assert_response :not_found

      upload = Rack::Test::UploadedFile.new(temp.path, "image/png")
      post "#{@url}/#{edition.fetch("id")}/upload_asset",
        headers: auth(@editor),
        params: { lock_version: edition.fetch("lock_version"), slot: "headerLogo", file: upload }
      assert_response :success
    end

    assert GazetteEdition.find(edition.fetch("id")).media_assets.attached?
    assert response.parsed_body.fetch("asset_urls").fetch("headerLogo").present?
  end

  test "continuation pages persist with source offsets and a shared immutable snapshot" do
    @article.update!(body: "Premier paragraphe. Second paragraphe. Troisième paragraphe.")
    input = payload
    input[:pages] = [
      { id: 1, template: "portrait", articleId: @article.id,
        rubric: "Portrait", note: "", contentStart: 0, contentEnd: 20, continuation: false },
      { id: 2, template: "reportage", articleId: @article.id,
        rubric: "Suite de l'article", note: "", contentStart: 20, contentEnd: 60, continuation: true }
    ]

    post @url, headers: auth(@editor), params: { gazette_edition: input }
    assert_response :created
    edition = response.parsed_body
    assert_equal 2, edition.fetch("pages").length

    patch "#{@url}/#{edition.fetch("id")}/publish",
      headers: auth(@editor), params: { lock_version: edition.fetch("lock_version") }
    assert_response :success

    printed = response.parsed_body.fetch("pages")
    assert_equal [0, 20], printed.map { |page| page.fetch("contentStart") }
    assert_equal [20, 60], printed.map { |page| page.fetch("contentEnd") }
    assert_equal [false, true], printed.map { |page| page.fetch("continuation") }
    assert_equal printed.first.fetch("article_snapshot").fetch("body"),
                 printed.last.fetch("article_snapshot").fetch("body")
  end

  test "invalid continuation range is rejected at publication" do
    input = payload
    input[:pages] = [
      { id: 1, template: "portrait", articleId: @article.id,
        rubric: "Portrait", note: "", contentStart: 0, contentEnd: 10_000, continuation: false }
    ]
    post @url, headers: auth(@editor), params: { gazette_edition: input }
    assert_response :created
    edition = response.parsed_body

    patch "#{@url}/#{edition.fetch("id")}/publish",
      headers: auth(@editor), params: { lock_version: edition.fetch("lock_version") }
    assert_response :unprocessable_entity
    assert GazetteEdition.find(edition.fetch("id")).draft?
  end

  test "negative continuation offsets are rejected during draft creation" do
    input = payload
    input[:pages] = [
      { id: 1, template: "portrait", articleId: @article.id,
        rubric: "Portrait", note: "", contentStart: -1, contentEnd: 12, continuation: false }
    ]
    post @url, headers: auth(@editor), params: { gazette_edition: input }
    assert_response :unprocessable_entity
  end

  private

  def payload
    {
      issue_label: "N° #{SecureRandom.hex(4)}",
      edition_label: "Octobre 2026",
      settings: {
        subtitle: "de Martine et Jean-Michel",
        territory: "SECTEUR ARDÈCHE", banner: "ANNONCEUR",
        contact: "Numéro fictif", legal: "Mentions"
      },
      pages: [
        { id: 1, template: "portrait", articleId: @article.id,
          rubric: "Portrait d'artisan", note: "" }
      ]
    }
  end

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
