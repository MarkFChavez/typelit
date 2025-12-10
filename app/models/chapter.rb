class Chapter < ApplicationRecord
  belongs_to :book
  has_many :passages, -> { order(:position) }, dependent: :destroy

  validates :position, presence: true
end
