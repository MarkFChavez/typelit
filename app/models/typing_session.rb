class TypingSession < ApplicationRecord
  belongs_to :passage

  validates :wpm, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :accuracy, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :duration_seconds, presence: true, numericality: { greater_than: 0 }

  before_create :set_completed_at

  scope :recent, -> { order(completed_at: :desc) }

  private

  def set_completed_at
    self.completed_at ||= Time.current
  end
end
