class StagedBook < ApplicationRecord
  belongs_to :user

  has_one_attached :cover_image
  has_one_attached :epub_file

  validates :title, presence: true

  def included_chapters
    (chapters_data || []).select { |ch| ch["included"] }
  end

  def total_word_count
    included_chapters.sum { |ch| ch["content"].to_s.split.size }
  end
end
