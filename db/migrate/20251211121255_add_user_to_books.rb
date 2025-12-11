class AddUserToBooks < ActiveRecord::Migration[8.0]
  def change
    add_reference :books, :user, foreign_key: true

    reversible do |dir|
      dir.up do
        if Book.exists?
          default_user = User.first || User.create!(username: "admin", password: "password")
          Book.update_all(user_id: default_user.id)
        end
      end
    end

    change_column_null :books, :user_id, false
  end
end
