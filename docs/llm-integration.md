# LLM Integration

How Qalam uses LLMs to generate word-by-word verse analysis.

## Overview

LLMs are used **only at build time** to generate linguistic analysis. They are NOT used for:
- Generating Quranic text (sourced from Tanzil.net)
- Generating translations (sourced from Sahih International)
- Runtime evaluation (planned for future)

## Seed Script

The seed script (`npm run seed:analysis`) generates word-by-word analysis for verses.

### Prerequisites

1. [Ollama](https://ollama.ai) installed and running
2. A suitable model pulled (see recommendations below)
3. Environment configured

### Configuration

Create `.env` file:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:72b
```

### Running

```bash
# Start Ollama (if not running)
ollama serve

# Pull recommended model
ollama pull qwen2.5:72b

# Run seed script
npm run seed:analysis
```

### Features

- **Resume support**: Skips already-generated files if interrupted
- **Two-phase generation**: Base analysis first, then detailed word analysis
- **Validation**: Validates JSON structure before saving

## Model Recommendations

| Model | Size | Arabic Quality | Speed |
|-------|------|----------------|-------|
| qwen2.5:72b | 40GB | Excellent | Slow |
| qwen2.5:32b | 18GB | Very Good | Medium |
| llama3.2 | 4GB | Basic | Fast |

For Quranic Arabic analysis, larger models produce significantly better results.

## Two-Phase Generation

To improve reliability and avoid timeouts, analysis is split into two phases:

### Phase 1: Base Analysis

Generates verse info and simplified word list (~1-2 minutes):
- Verse metadata (Arabic, transliteration)
- Basic word list with meanings
- Root summary
- Literal translation

See: [analysis-prompt-base.md](./analysis-prompt-base.md)

### Phase 2: Word Details

Generates detailed analysis for each word (~30-60 seconds each):
- Grammar (case, gender, number)
- Morphology (pattern, word type)
- Components (for compound words)
- Syntactic function

See: [analysis-prompt-word.md](./analysis-prompt-word.md)

## Output Format

Analysis files are saved to `public/data/analysis/{surah}-{verse}.json`:

```json
{
  "verseId": "1:2",
  "verse": {
    "arabic": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "transliteration": "al-ḥamdu lillāhi rabbi al-ʿālamīn",
    "surah": "Al-Fatihah",
    "verseNumber": 2
  },
  "words": [
    {
      "wordNumber": 1,
      "arabic": "الْحَمْدُ",
      "transliteration": "al-ḥamdu",
      "meaning": "the praise",
      "root": {
        "letters": "ح-م-د",
        "transliteration": "ḥ-m-d",
        "meaning": "to praise"
      },
      "grammar": {
        "case": "nominative (marfūʿ)",
        "gender": "masculine",
        "number": "singular"
      }
    }
  ],
  "literalTranslation": {
    "wordAligned": "The-praise [is] for-Allah, Lord [of] the-worlds"
  },
  "rootSummary": [
    {
      "word": "الْحَمْدُ",
      "root": "ح-م-د (ḥ-m-d)",
      "coreMeaning": "praise, gratitude"
    }
  ]
}
```

## Current Coverage

Analysis has been generated for:
- **Surah Al-Fatihah** (1:1-7)
- **Juz Amma** (Surahs 78-114)

Total: ~550 verses with full word-by-word analysis.

## Adding More Verses

1. Ensure Ollama is running with a capable model
2. Run `npm run seed:analysis`
3. Script will generate analysis for remaining verses
4. Commit the new analysis files

## Troubleshooting

**Ollama not responding:**
```bash
curl http://localhost:11434/api/tags
# If error, start Ollama:
ollama serve
```

**Model not found:**
```bash
ollama list
ollama pull qwen2.5:72b
```

**Invalid JSON responses:**
- Try a larger model for better Arabic handling
- Script has retry logic (3 attempts per verse)

**Script stops mid-way:**
Just run again - it resumes from where it stopped.

## Future: Runtime Evaluation

Planned feature: Users submit translation attempts and receive AI feedback.

This would require:
- Runtime LLM API (Ollama or cloud provider)
- Evaluation prompt comparing user input to correct translation
- Scoring and feedback generation

Currently not implemented - the app only displays pre-computed analysis.
