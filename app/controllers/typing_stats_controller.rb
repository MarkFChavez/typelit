class TypingStatsController < ApplicationController
  def index
    range = params[:range] || "7_days"

    sessions = TypingSession.all
    sessions = apply_date_filter(sessions, range)
    sessions = sessions.order(:completed_at)

    grouped = sessions.group_by { |s| s.completed_at.to_date }

    render json: {
      labels: grouped.keys.map { |date| date.strftime("%b %d") },
      datasets: {
        wpm: grouped.values.map { |day_sessions|
          (day_sessions.sum(&:wpm).to_f / day_sessions.size).round
        },
        accuracy: grouped.values.map { |day_sessions|
          (day_sessions.sum(&:accuracy).to_f / day_sessions.size).round(1)
        }
      },
      summary: {
        total_sessions: sessions.size,
        avg_wpm: sessions.any? ? (sessions.sum(&:wpm).to_f / sessions.size).round : 0,
        avg_accuracy: sessions.any? ? (sessions.sum(&:accuracy).to_f / sessions.size).round(1) : 0,
        total_time_minutes: (sessions.sum(&:duration_seconds) / 60.0).round
      }
    }
  end

  private

  def apply_date_filter(sessions, range)
    case range
    when "7_days"
      sessions.where("completed_at >= ?", 7.days.ago)
    when "30_days"
      sessions.where("completed_at >= ?", 30.days.ago)
    when "all_time"
      sessions
    else
      sessions.where("completed_at >= ?", 7.days.ago)
    end
  end
end
