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
