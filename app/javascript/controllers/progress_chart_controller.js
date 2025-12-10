import { Controller } from "@hotwired/stimulus"
import Chart from "chart.js/auto"

export default class extends Controller {
  static targets = ["canvas", "loading", "empty", "summary"]
  static values = {
    url: String
  }

  connect() {
    this.chart = null
    this.fetchData("7_days")
  }

  async fetchData(range) {
    this.showLoading()

    try {
      const response = await fetch(`${this.urlValue}?range=${range}`)
      const data = await response.json()

      if (data.labels.length === 0) {
        this.showEmpty()
        return
      }

      this.hideLoading()
      this.renderChart(data)
      this.updateSummary(data.summary)
    } catch (error) {
      console.error("Error fetching stats:", error)
      this.showEmpty()
    }
  }

  selectRange(event) {
    const range = event.currentTarget.dataset.range

    this.element.querySelectorAll("[data-range]").forEach(btn => {
      btn.classList.remove("bg-stone-700", "text-white")
      btn.classList.add("bg-stone-200", "text-stone-700")
    })
    event.currentTarget.classList.remove("bg-stone-200", "text-stone-700")
    event.currentTarget.classList.add("bg-stone-700", "text-white")

    this.fetchData(range)
  }

  renderChart(data) {
    if (this.chart) {
      this.chart.destroy()
    }

    const ctx = this.canvasTarget.getContext("2d")

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "WPM",
            data: data.datasets.wpm,
            borderColor: "#44403c",
            backgroundColor: "rgba(68, 64, 60, 0.1)",
            tension: 0.3,
            yAxisID: "y",
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Accuracy %",
            data: data.datasets.accuracy,
            borderColor: "#78716c",
            backgroundColor: "rgba(120, 113, 108, 0.1)",
            tension: 0.3,
            yAxisID: "y1",
            pointRadius: 4,
            pointHoverRadius: 6,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: { family: "'JetBrains Mono', monospace" },
              color: "#57534e"
            }
          },
          tooltip: {
            backgroundColor: "#1c1917",
            titleFont: { family: "'JetBrains Mono', monospace" },
            bodyFont: { family: "'JetBrains Mono', monospace" }
          }
        },
        scales: {
          x: {
            grid: { color: "#e7e5e4" },
            ticks: {
              font: { family: "'JetBrains Mono', monospace" },
              color: "#78716c"
            }
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "WPM",
              font: { family: "'JetBrains Mono', monospace" },
              color: "#44403c"
            },
            grid: { color: "#e7e5e4" },
            ticks: {
              font: { family: "'JetBrains Mono', monospace" },
              color: "#78716c"
            },
            min: 0
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Accuracy %",
              font: { family: "'JetBrains Mono', monospace" },
              color: "#78716c"
            },
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
            ticks: {
              font: { family: "'JetBrains Mono', monospace" },
              color: "#78716c"
            }
          }
        }
      }
    })
  }

  updateSummary(summary) {
    if (this.hasSummaryTarget) {
      this.summaryTarget.innerHTML = `
        <div class="grid grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-mono font-medium text-stone-900">${summary.total_sessions}</div>
            <div class="text-sm text-stone-500">Sessions</div>
          </div>
          <div>
            <div class="text-2xl font-mono font-medium text-stone-900">${summary.avg_wpm}</div>
            <div class="text-sm text-stone-500">Avg WPM</div>
          </div>
          <div>
            <div class="text-2xl font-mono font-medium text-stone-900">${summary.avg_accuracy}%</div>
            <div class="text-sm text-stone-500">Avg Accuracy</div>
          </div>
          <div>
            <div class="text-2xl font-mono font-medium text-stone-900">${summary.total_time_minutes}</div>
            <div class="text-sm text-stone-500">Minutes</div>
          </div>
        </div>
      `
    }
  }

  showLoading() {
    if (this.hasLoadingTarget) this.loadingTarget.classList.remove("hidden")
    if (this.hasEmptyTarget) this.emptyTarget.classList.add("hidden")
    this.canvasTarget.classList.add("hidden")
  }

  hideLoading() {
    if (this.hasLoadingTarget) this.loadingTarget.classList.add("hidden")
    this.canvasTarget.classList.remove("hidden")
  }

  showEmpty() {
    if (this.hasLoadingTarget) this.loadingTarget.classList.add("hidden")
    if (this.hasEmptyTarget) this.emptyTarget.classList.remove("hidden")
    this.canvasTarget.classList.add("hidden")
  }

  disconnect() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
