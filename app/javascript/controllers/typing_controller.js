import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display", "input", "wpm", "accuracy", "progress", "timer", "hint"]
  static values = {
    passageContent: String,
    passageId: Number,
    nextPassageUrl: String
  }

  connect() {
    this.typedText = ""
    this.startTime = null
    this.errors = 0
    this.totalTyped = 0
    this.completed = false

    this.renderPassage()
    this.focusInput()

    // Focus input when clicking anywhere in the typing area
    this.element.addEventListener("click", () => this.focusInput())
  }

  renderPassage() {
    const content = this.passageContentValue
    const html = content
      .split("")
      .map((char, i) => {
        if (char === "\n") {
          // Render newline as a visible indicator followed by actual line break
          return `<span data-index="${i}" class="untyped newline-char">↵</span><br>`
        }
        return `<span data-index="${i}" class="untyped">${this.escapeHtml(char)}</span>`
      })
      .join("")

    this.displayTarget.innerHTML = html
    this.charSpans = this.displayTarget.querySelectorAll("span[data-index]")

    // Create caret element
    this.caret = document.createElement("span")
    this.caret.className = "caret"
    this.updateCaretPosition()

    this.updateProgress()
  }

  focusInput() {
    this.inputTarget.focus()
  }

  handleInput(event) {
    if (this.completed) return

    // Start timer on first keystroke
    if (!this.startTime) {
      this.startTime = Date.now()
      this.startTimer()
      this.hideHint()
    }

    const typed = this.inputTarget.value
    const content = this.passageContentValue

    // Track total keystrokes for accuracy
    if (typed.length > this.typedText.length) {
      this.totalTyped++
      const newCharIndex = typed.length - 1
      if (newCharIndex < content.length && typed[newCharIndex] !== content[newCharIndex]) {
        this.errors++
      }
    }

    this.typedText = typed
    this.updateDisplay()
    this.updateStats()
    this.updateProgress()

    // Check for completion
    if (typed.length >= content.length && typed === content) {
      this.complete()
    }
  }

  handleKeydown(event) {
    // Prevent tab from leaving the input
    if (event.key === "Tab") {
      event.preventDefault()
    }
  }

  updateDisplay() {
    const typed = this.typedText
    const content = this.passageContentValue

    this.charSpans.forEach((span, i) => {
      span.classList.remove("typed-correct", "typed-incorrect", "untyped")

      if (i < typed.length) {
        if (typed[i] === content[i]) {
          span.classList.add("typed-correct")
        } else {
          span.classList.add("typed-incorrect")
        }
      } else {
        span.classList.add("untyped")
      }
    })

    this.updateCaretPosition()

    // Scroll to keep caret visible
    if (this.caret.parentNode) {
      this.caret.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  updateCaretPosition() {
    // Remove caret from current position
    if (this.caret.parentNode) {
      this.caret.parentNode.removeChild(this.caret)
    }

    const position = this.typedText.length

    if (position < this.charSpans.length) {
      // Insert caret before the current character
      const currentSpan = this.charSpans[position]
      currentSpan.parentNode.insertBefore(this.caret, currentSpan)
    } else {
      // At the end, append caret after last character
      this.displayTarget.appendChild(this.caret)
    }
  }

  updateStats() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000
    const wordsTyped = this.typedText.split(/\s+/).filter(w => w.length > 0).length

    // Standard WPM calculation: (characters / 5) / minutes
    const standardWords = this.typedText.length / 5
    const wpm = elapsedMinutes > 0 ? Math.round(standardWords / elapsedMinutes) : 0

    const accuracy = this.totalTyped > 0
      ? Math.round(((this.totalTyped - this.errors) / this.totalTyped) * 100)
      : 100

    this.wpmTarget.textContent = wpm
    this.accuracyTarget.textContent = accuracy
  }

  updateProgress() {
    const progress = (this.typedText.length / this.passageContentValue.length) * 100
    this.progressTarget.style.width = `${progress}%`
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.startTime && !this.completed) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        const minutes = Math.floor(elapsed / 60)
        const seconds = elapsed % 60
        this.timerTarget.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }
    }, 1000)
  }

  hideHint() {
    if (this.hasHintTarget) {
      this.hintTarget.classList.add("hidden")
    }
  }

  async complete() {
    this.completed = true
    clearInterval(this.timerInterval)

    const durationSeconds = Math.round((Date.now() - this.startTime) / 1000)
    const standardWords = this.typedText.length / 5
    const wpm = Math.round(standardWords / (durationSeconds / 60))
    const accuracy = this.totalTyped > 0
      ? ((this.totalTyped - this.errors) / this.totalTyped) * 100
      : 100

    // Post results to server
    try {
      const response = await fetch(`/passages/${this.passageIdValue}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify({
          typing_session: {
            wpm: wpm,
            accuracy: accuracy.toFixed(2),
            duration_seconds: durationSeconds
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Brief pause to show completion, then navigate
        setTimeout(() => {
          window.Turbo.visit(data.next_passage_url)
        }, 500)
      }
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  disconnect() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  }
}
