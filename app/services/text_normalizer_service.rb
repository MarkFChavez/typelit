class TextNormalizerService
  REPLACEMENTS = {
    # Smart quotes -> straight quotes
    "\u201c" => '"',  # left double quote "
    "\u201d" => '"',  # right double quote "
    "\u2018" => "'",  # left single quote '
    "\u2019" => "'",  # right single quote ' (also apostrophe)
    "\u201a" => "'",  # single low quote ‚
    "\u201e" => '"',  # double low quote „

    # Dashes
    "\u2014" => "--",  # em-dash —
    "\u2013" => "-",   # en-dash –
    "\u2012" => "-",   # figure dash ‒
    "\u2015" => "--",  # horizontal bar ―

    # Ellipsis and dots
    "\u2026" => "...", # ellipsis …

    # Spaces
    "\u00a0" => " ",   # non-breaking space
    "\u2003" => " ",   # em space
    "\u2002" => " ",   # en space
    "\u2009" => " ",   # thin space
    "\u200a" => " ",   # hair space
    "\u200b" => "",    # zero-width space (remove)

    # Other punctuation
    "\u2022" => "-",   # bullet •
    "\u2023" => ">",   # triangular bullet ‣
    "\u2043" => "-",   # hyphen bullet ⁃
    "\u00ab" => "<<",  # left guillemet «
    "\u00bb" => ">>",  # right guillemet »
    "\u2039" => "<",   # single left guillemet ‹
    "\u203a" => ">",   # single right guillemet ›

    # Legal/trademark symbols
    "\u00a9" => "(c)",   # copyright ©
    "\u00ae" => "(R)",   # registered ®
    "\u2122" => "(TM)",  # trademark ™
    "\u2120" => "(SM)",  # service mark ℠

    # Other common symbols
    "\u00a7" => "S.",    # section §
    "\u00b6" => "P.",    # pilcrow/paragraph ¶
    "\u00a4" => "$",     # currency ¤
    "\u00a5" => "Y",     # yen ¥
    "\u00a3" => "L",     # pound £
    "\u20ac" => "E",     # euro €
    "\u00b0" => " degrees",  # degree °
    "\u00b1" => "+/-",   # plus-minus ±
    "\u00d7" => "x",     # multiplication ×
    "\u00f7" => "/",     # division ÷
  }.freeze

  def initialize(text)
    @text = text.to_s
  end

  def normalize
    result = @text.dup

    REPLACEMENTS.each do |from, to|
      result.gsub!(from, to)
    end

    # Normalize multiple spaces to single space (but preserve newlines)
    result.gsub!(/ +/, " ")

    # Normalize multiple newlines to double newline (paragraph break)
    result.gsub!(/\n{3,}/, "\n\n")

    # Remove leading/trailing whitespace from each line
    result = result.lines.map(&:strip).join("\n")

    # Final trim
    result.strip
  end
end
