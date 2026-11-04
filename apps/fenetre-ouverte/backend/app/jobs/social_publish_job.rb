# L'envoi vers une plateforme est indépendant de la validation éditoriale.
# Jamais d'envoi implicite : seul un compte OAuth réellement connecté
# et un réseau explicitement demandé déclenchent cette tâche.
class SocialPublishJob < ApplicationJob
  queue_as :default

  def perform(social_post_id)
    post = SocialPost.find_by(id: social_post_id)
    return unless post&.publication&.published?
    return unless post.pending?

    # Compare-and-swap : un job rejoué ne republie pas le même contenu.
    claimed = SocialPost.where(id: post.id, status: SocialPost.statuses.fetch("pending"))
                        .update_all(status: SocialPost.statuses.fetch("processing"), updated_at: Time.current)
    return if claimed.zero?

    SocialPublisher.call(post.reload)
  end
end
