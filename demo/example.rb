class Signal
  attr_reader :samples

  def initialize(samples)
    @samples = samples.freeze
  end

  def average
    samples.sum.to_f / samples.length
  end

  def normalize
    peak = samples.map(&:abs).max
    samples.map { |value| value / peak }
  end
end

signal = Signal.new([0.2, 0.8, -0.5, 1.0])
puts "Average: #{signal.average}"
