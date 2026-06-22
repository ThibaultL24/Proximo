# app/serializers/user_serializer.rb
class UserSerializer < AlbaResource
  attributes :id, :email, :role, :first_name, :last_name, :phone

  attribute :full_name, &:full_name
end
