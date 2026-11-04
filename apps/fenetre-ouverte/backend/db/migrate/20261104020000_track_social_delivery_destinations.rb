class TrackSocialDeliveryDestinations < ActiveRecord::Migration[8.0]
  def change
    add_column :social_posts, :destination_url, :string
    add_column :social_posts, :external_url, :text
  end
end
