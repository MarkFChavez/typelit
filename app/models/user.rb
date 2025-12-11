class User < ApplicationRecord
  has_secure_password

  has_many :books, dependent: :destroy
  has_many :staged_books, dependent: :destroy

  validates :username, presence: true, uniqueness: true
end
