# Scoring and placement

Volume is a label, never a made-up integer.

| Label | When |
|---|---|
| Measured | User pasted GSC, Ahrefs, or another export |
| Proxy | Google Autocomplete hit count from `suggest.py` |
| Unknown | Default |

Difficulty is read from the live top 10, not a KD metric.

| SERP | Treat as |
|---|---|
| Google Help + thin blogs | High. Answer PAA faster and more specifically than the listicles |
| Forums / Reddit / one official page | Medium. A clear owner how-to can compete |
| Weak or mismatched intent | Lower. Still one primary per URL |

## Where each keyword goes

| Slot | What |
|---|---|
| Primary | One per URL. Title, H1, slug, first 100 words of body, dek/meta |
| Secondary | H2 / H3, PAA-style questions, FAQ JSON-LD (question-mark H2s) |
| Cross-link | Anchor text = the other URL’s primary (`[[negative]]`, `[[examples]]`) |
| Off-page | Revenue ranges → `[[page:research]]`. Never the 0.12 × formula |

Do not stuff. If the primary does not fit a real sentence, the title is wrong.

## This site’s cluster map (do not cannibalize)

| id | EN slug | Primary job |
|---|---|---|
| remove | how-to-remove-a-google-review | Owner cannot delete; customer can; report fakes |
| verify | how-to-verify-google-business-profile | Claim + verify (GMB once in the dek) |
| examples | google-review-response-examples | Copy you can adapt this week |
| negative | how-to-respond-to-negative-google-reviews | Sequence: wait, name, take it off the listing |
| seo | do-google-reviews-help-seo | Yes for local/Maps; not a blue-link switch |

`examples` and `negative` share “negative google review response examples” in autocomplete. Keep two URLs. Cross-link. Do not merge.
