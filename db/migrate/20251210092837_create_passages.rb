class CreatePassages < ActiveRecord::Migration[8.0]
  def change
    create_table :passages do |t|
      t.references :chapter, null: false, foreign_key: true
      t.text :content
      t.integer :position
      t.integer :word_count

      t.timestamps
    end

    add_index :passages, [ :chapter_id, :position ]
  end
end
