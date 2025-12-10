class CreateTypingSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :typing_sessions do |t|
      t.references :passage, null: false, foreign_key: true
      t.integer :wpm
      t.decimal :accuracy
      t.integer :duration_seconds
      t.datetime :completed_at

      t.timestamps
    end
  end
end
