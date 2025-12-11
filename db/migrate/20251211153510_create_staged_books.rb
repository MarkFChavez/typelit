class CreateStagedBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :staged_books do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.string :author
      t.jsonb :chapters_data

      t.timestamps
    end
  end
end
