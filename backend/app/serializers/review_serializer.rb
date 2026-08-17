# app/serializers/review_serializer.rb
class ReviewSerializer < AlbaResource
  attributes :id, :body, :rating, :created_at

  attribute :author_name do |review|
    review.user.full_name.presence || review.user.email.split("@").first
  end

  attribute :author_id do |review|
    review.user_id
  end

  attribute :author_role do |review|
    review.user.role
  end

  attribute :reply do |review|
    next unless review.reply

    {
      id: review.reply.id,
      body: review.reply.body,
      created_at: review.reply.created_at,
      author_name: review.reply.user.full_name.presence || review.reply.user.email.split("@").first,
      author_role: review.reply.user.role
    }
  end
end
