# app/serializers/social_account_serializer.rb
class SocialAccountSerializer < AlbaResource
  attributes :id, :provider, :account_name, :status, :connected_at

  attribute :demo do |account|
    account.demo?
  end
end
