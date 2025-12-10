class Book < ApplicationRecord
  has_many :chapters, -> { order(:position) }, dependent: :destroy
  has_many :passages, through: :chapters
  has_many :typing_sessions, through: :passages

  has_one_attached :cover_image
  has_one_attached :epub_file

  validates :title, presence: true

  def progress_percentage
    return 0 if passages.empty?

    completed_passages = passages.joins(:typing_sessions).distinct.count
    (completed_passages.to_f / passages.count * 100).round
  end

  def current_passage
    passages
      .left_joins(:typing_sessions)
      .where(typing_sessions: { id: nil })
      .order("chapters.position", :position)
      .first || passages.order("chapters.position", :position).first
  end

  def total_words
    passages.sum(:word_count)
  end
end
