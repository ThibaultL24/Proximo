# app/models/agency.rb
class Agency < ApplicationRecord
  has_many :users, dependent: :nullify
  has_many :merchants, dependent: :restrict_with_error
  has_many :sectors, dependent: :restrict_with_error
  has_many :articles, dependent: :restrict_with_error
  has_many :leads, dependent: :restrict_with_error
  has_many :products, dependent: :destroy
  has_many :admin_users, -> { where(role: :admin) }, class_name: "User"

  enum :status, { draft: 0, active: 1, suspended: 2 }

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }

  def subscription_active?
    AgencySubscriptionService.for(self).active?
  end

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
