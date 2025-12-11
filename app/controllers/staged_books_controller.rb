class StagedBooksController < ApplicationController
  before_action :set_staged_book

  def show
  end

  def update
    chapter_index = params[:chapter_index].to_i
    chapters = @staged_book.chapters_data || []

    if chapters[chapter_index]
      chapters[chapter_index]["included"] = !chapters[chapter_index]["included"]
      @staged_book.update!(chapters_data: chapters)
    end

    redirect_to @staged_book
  end

  def destroy
    @staged_book.destroy
    redirect_to books_path, notice: "Upload cancelled."
  end

  def finalize
    included_chapters = @staged_book.included_chapters

    if included_chapters.empty?
      redirect_to @staged_book, alert: "Please select at least one chapter."
      return
    end

    book = current_user.books.build(
      title: @staged_book.title,
      author: @staged_book.author,
      uploaded_at: Time.current
    )

    if book.save
      if @staged_book.cover_image.attached?
        book.cover_image.attach(@staged_book.cover_image.blob)
      end

      if @staged_book.epub_file.attached?
        book.epub_file.attach(@staged_book.epub_file.blob)
      end

      create_chapters_and_passages(book, included_chapters)

      @staged_book.destroy
      redirect_to book, notice: "Book saved successfully!"
    else
      redirect_to @staged_book, alert: "Error saving book: #{book.errors.full_messages.join(', ')}"
    end
  end

  private

  def set_staged_book
    @staged_book = current_user.staged_books.find(params[:id])
  end

  def create_chapters_and_passages(book, chapters_data)
    chapters_data.each_with_index do |chapter_data, chapter_index|
      chapter = book.chapters.create!(
        title: chapter_data["title"],
        position: chapter_index + 1
      )

      passages = PassageSplitterService.new(chapter_data["content"]).split

      passages.each_with_index do |content, passage_index|
        chapter.passages.create!(
          content: content,
          position: passage_index + 1
        )
      end
    end
  end
end
