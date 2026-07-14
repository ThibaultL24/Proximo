# app/serializers/user_serializer.rb
class UserSerializer < AlbaResource
  attributes :id, :email, :role, :first_name, :last_name, :phone

  attribute :full_name, &:full_name

  attribute :subscription, if: proc { |user| user.client? } do |user|
    ClientSubscriptionService.for(user).status
  end

  attribute :agency, if: proc { |user| user.admin? && user.agency.present? } do |user|
    {
      id: user.agency.id,
      name: user.agency.name,
      slug: user.agency.slug,
      subscription: AgencySubscriptionService.for(user.agency).status
    }
  end
end
