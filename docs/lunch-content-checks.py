"""L02 documentation audit; does not import, transcribe or execute game content.

Run from repository root: python docs/lunch-content-checks.py
Reproduce L02b audit: append --review-base 55d037e40b215c3286fe873500de67466dbb5f7c
Checks markdown catalogs, substituted copy, relationship references and hand sums.
Engine validation, rendered layout, human playtesting and balance remain later gates.
"""

from collections import defaultdict
from fractions import Fraction
from itertools import product
from pathlib import Path
import re
import argparse
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'docs/content-table.md'
TEXT = SOURCE.read_text(encoding='utf-8')


def tables(text):
    section = ''
    header = None
    for number, line in enumerate(text.splitlines(), 1):
        if line.startswith('#'):
            section = line.lstrip('# ').strip()
            header = None
        if not line.startswith('|'):
            header = None
            continue
        cells = [x.strip() for x in line.strip('|').split('|')]
        if all(re.fullmatch(r':?-+:?', x) for x in cells):
            continue
        if header is None:
            header = cells
        else:
            assert len(cells) == len(header), (section, number, 'column count')
            yield section, number, dict(zip(header, cells))


ROWS = list(tables(TEXT))
families = {r['ID']: r for s, n, r in ROWS if s == 'Families and draw eligibility'}
assert len(families) == 21
base = {k: v for k, v in families.items() if 'Source' not in v}
callbacks = {k: v for k, v in families.items() if v['Kind'] == 'callback'}
assert len(base) == 17 and len(callbacks) == 3 and 'filler' in families
assert all(r['Weight'] == '1' for r in families.values())
cuisines = {r['ID']: r['Name'] for s, n, r in ROWS if s == 'Cuisine catalog'}
attendees = {r['ID']: r for s, n, r in ROWS if s == 'Attendees and voice guide'}
assert set(attendees) == {'priya', 'dev', 'sam', 'morgan', 'gary', 'jordan', 'legal', 'vp'}
assert sum(r['Starts present'] == 'yes' for r in attendees.values()) == 6
reasons = {r['Key']: r['Copy'] for s, n, r in ROWS if s == 'Disabled reasons'}
arrivals = {(r['Event ID'], r['Response ID']): r['Attendee ID']
           for s, n, r in ROWS if 'Attendee ID' in r}
parents = {r['Parent']: r['Target'] for s, n, r in ROWS if 'Parent' in r}
assert len(set(parents.values())) == 3 and set(parents.values()) == set(callbacks)
assert all(callbacks[t]['Source'] == p for p, t in parents.items())
assert all(r['Family when'] == '—' and r['Rarity'] == 'common'
           and r['Negative'] == 'false' for r in callbacks.values())
assert len([r for r in base.values() if r['Kind'] == 'substantive'
            and r['Rarity'] == 'common' and r['Family when'] == '—']) >= 3
presentations = [(s, r) for s, n, r in ROWS if 'Presentation' in r]
assert {s for s, r in presentations} == set(families)
assert len(presentations) == 22
assert len({(s, r['Presentation']) for s, r in presentations}) == 22
for s, r in presentations:
    assert r['Response set'] == s
    assert r['Speaker'] in attendees or r['Speaker'] == 'room'
    if r['Speaker'] in {'legal', 'vp'}:
        assert (s, r['Speaker']) in {('alex-arrives', 'legal'), ('pat-arrives', 'vp')}
    assert r['Variant when'] in {'—', 'present: vp'}

responses = defaultdict(list)
for s, n, r in ROWS:
    if 'Outcome line' in r:
        responses[s, r['Response']].append(r)
used_reasons = set()
used_arrivals = set()
scheduled = set()
for (event, response), branches in responses.items():
    assert event in families and 1 <= len(branches) <= 2
    assert len({r['Outcome'] for r in branches}) == len(branches)
    assert all(re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*', r['Outcome']) for r in branches)
    assert 0 < sum(int(r['Weight']) for r in branches) <= 65536
    assert all(int(r['Weight']) > 0 for r in branches)
    for r in branches:
        assert 1 <= int(r['Min']) <= 10 and -10 <= int(r['P']) <= 25
        assert r['Technique'] in {'hear', 'timebox', 'park', 'owner', 'email', 'refocus', 'ack'}
        for key in ['Label', 'Description', 'Technique', 'Requires', 'Reason key']:
            assert r[key] == branches[0][key], (event, response, 'branch response mismatch')
        assert r['Requires'] in {'—', 'present: legal', 'present: vp', 'absent: legal', 'absent: vp'}
        if r['Requires'] != '—':
            assert r['Reason key'] in reasons
            used_reasons.add(r['Reason key'])
        else:
            assert r['Reason key'] == '—'
        if r['Join'] != '—':
            assert arrivals[event, response] == r['Join']
            assert r['Join'] == branches[0]['Join']
            if event not in {'alex-arrives', 'pat-arrives'}:
                assert r['Requires'] == 'absent: ' + r['Join']
            else:
                assert 'absent: ' + r['Join'] in families[event]['Family when']
            used_arrivals.add((event, response))
        if r['CB'] != '—':
            assert parents[event] == r['CB'] and r['Technique'] == 'park'
            assert event not in callbacks
            scheduled.add((event, r['CB']))
        if r['End'] != '—':
            assert event == 'room-booked' and r['End'] in {'45', '60'}
        if event == 'room-booked':
            assert r['End'] in {'45', '60'}
        if r['Nom'] != '—':
            assert event == 'nominate-cuisine' and r['Nom'] in cuisines
for event in families:
    choices = [b for (e, rid), b in responses.items() if e == event]
    assert 1 <= len(choices) <= 3
    assert any(b[0]['Requires'] == '—' for b in choices)
    if any(len(b) == 2 for b in choices):
        assert any(len(b) == 1 and b[0]['Requires'] == '—' for b in choices)
assert used_reasons == set(reasons)
assert used_arrivals == set(arrivals)
assert scheduled == set(parents.items())
assert sum(len(branches) == 2 for branches in responses.values()) == 3
nom = [b[0] for (e, rid), b in responses.items() if e == 'nominate-cuisine']
assert {r['Nom'] for r in nom} == set(cuisines)
assert len({tuple(r[k] for k in ['Min', 'P', 'CB', 'Join', 'End']) for r in nom}) == 1
assert all(int(r['P']) < 100 for r in nom)
filler = responses['filler', 'ack'][0]
assert (filler['Min'], filler['P'], filler['CB'], filler['Join'], filler['End']) == ('2', '0', '—', '—', '—')

# Conservative full substitution of every authored copy cell, by Unicode code points.
substitutions = {'cuisine': 'Mexican', 'agreedCuisine': 'Mexican', 'attendee': 'Jordan',
                 'topic': 'spice preference', 'minute': '69', 'title': 'Played It Right, Lost Anyway',
                 'score': '1000', 'headcount': '8', 'unlocked': '12', 'cost': '$9,200',
                 'seed': '0123456789abcdef', 'revision': re.search(r'Revision \*\*([^*]+)\*\*', TEXT).group(1),
                 'roster': ', '.join(r['Name'] for r in attendees.values())}
lengths = []
rendered_count = 0
topic_values = [r['Topic'] for s, n, r in ROWS if 'Event / park response' in r]
catalog_values = {'cuisine': list(cuisines.values()), 'agreedCuisine': list(cuisines.values()),
                  'attendee': [r['Name'] for r in attendees.values()], 'topic': topic_values}
for s, n, r in ROWS:
    for key in ['Opening line', 'Label', 'Description', 'Outcome line', 'Role', 'Line', 'Copy', 'Flavour line']:
        if key not in r:
            continue
        value = r[key]
        tokens = list(dict.fromkeys(re.findall(r'\{(\w+)\}', value)))
        for token in tokens:
            assert token in substitutions, (s, n, 'unknown placeholder', token)
        limit = 24 if key == 'Label' else 48 if key == 'Role' else 90
        values = [catalog_values.get(token, [substitutions[token]]) for token in tokens]
        maximum = 0
        for combination in product(*values):
            rendered = value
            for token, replacement in zip(tokens, combination):
                rendered = rendered.replace('{' + token + '}', replacement)
            assert len(rendered) <= limit, (s, n, key, len(rendered), limit, rendered)
            if '{topic}' in value:
                assert not re.search(r"\bThe \w+'s", rendered), (s, n, 'possessive topic grammar', rendered)
            maximum = max(maximum, len(rendered))
            rendered_count += 1
        if key in {'Label', 'Description'}:
            assert not re.search(r'\d|\b(?:percent|probability|utility)\b', value, re.I), (s, n, 'numeric preview')
        lengths.append((maximum, limit, s, key))
titles = [r for s, n, r in ROWS if s == 'Title catalog' and 'Slot' in r]
assert len(titles) == 12 and {int(r['Slot']) for r in titles} == set(range(1, 13))
assert len({r['ID'] for r in titles}) == 12
assert all(len(r['Name']) <= 28 for r in titles)
assert [r['ID'] for r in titles if r['Slot'] in {'3', '5', '8'}] == ['lunch-agreed', 'table-for-six', 'second-helping']
copy = {r['Key']: r['Copy'] for s, n, r in ROWS if s == 'Interface, results and share copy'}
for key in ['success-result', 'success-summary', 'ended-decision', 'fallback-decision-heading', 'share-success']:
    assert '{agreedCuisine}' in copy[key]
for key in ['failure-result', 'failure-nomination', 'share-nomination', 'share-early', 'share-expired', 'share-cancelled']:
    assert '{agreedCuisine}' not in copy[key]
assert 'Not agreed.' in copy['failure-nomination'] and 'Not agreed.' in copy['share-nomination']
epilogues = [r for s, n, r in ROWS if s == 'Epilogues and factual moments' and 'Ending' in r]
assert {r['Ending'] for r in epilogues} == {'decision', 'called-early', 'time-expired', 'cancelled'}
assert all(('{agreedCuisine}' in r['Line']) == (r['Ending'] == 'decision') for r in epilogues)
commentary = [r for s, n, r in ROWS if s == 'Fourth-wall commentary' and 'Priority' in r]
assert len(commentary) == len({r['ID'] for r in commentary}) == len({r['Priority'] for r in commentary}) == 7
assert set(r['ID'] for r in commentary).isdisjoint(r['ID'] for r in titles)
park_topics = [r for s, n, r in ROWS if 'Event / park response' in r]
assert {r['Event / park response'] for r in park_topics} == {
    e + ' / ' + rid for (e, rid), b in responses.items() if b[0]['Technique'] == 'park'}

# Verify the documented running sums, condition witnesses and callback due positions.
routes = defaultdict(list)
for s, n, r in ROWS:
    if 'H billed' in r:
        routes[s].append(r)
for name, route in routes.items():
    p = t = pm = 0
    present = {k for k, r in attendees.items() if r['Starts present'] == 'yes'}
    due = {}
    seen = set()
    previous_negative = False
    for turn, row in enumerate(route):
        event = row['Family']
        assert int(row['Turn']) == turn and event not in seen
        seen.add(event)
        assert turn != 0 or event == 'nominate-cuisine'
        assert turn != 1 or (families[event]['Kind'] == 'substantive' and families[event]['Rarity'] == 'common')
        assert not (previous_negative and families[event]['Rarity'] == 'uncommon' and families[event]['Negative'] == 'true')
        previous_negative = families[event]['Rarity'] == 'uncommon' and families[event]['Negative'] == 'true'
        if turn in due:
            assert event == due.pop(turn)
        if event in callbacks:
            assert any(x['Family'] == callbacks[event]['Source'] for x in route[:turn])
        r = next(x for x in responses[event, row['Response']] if x['Outcome'] == row['Outcome'])
        condition = r['Requires']
        if condition.startswith('present: '):
            assert condition[9:] in present
        if condition.startswith('absent: '):
            assert condition[8:] not in present
        if event == 'pat-arrives':
            assert t >= 15 and 'vp' not in present
        assert int(row['H billed']) == len(present)
        t += int(r['Min'])
        pm += int(r['Min']) * len(present)
        p = min(100, max(0, p + int(r['P'])))
        if r['Join'] != '—':
            assert r['Join'] not in present
            present.add(r['Join'])
        if r['CB'] != '—':
            assert turn + 2 not in due
            due[turn + 2] = r['CB']
        assert (p, t, pm) == (int(row['P after']), int(row['T after']), int(row['pm total'])), (name, turn, p, t, pm)
        assert p < 100 or turn == len(route) - 1
assert len(routes) == 3

# Callback mini-routes are also authored evidence, not just illustrative prose.
callback_routes = [r for s, n, r in ROWS if s == 'Every callback due at n+2']
assert len(callback_routes) == 3
for row in callback_routes:
    p = t = pm = 0
    scheduled_turn = None
    for turn, address in enumerate(row['Ordered resolutions'].split('; ')):
        event, response = address.split('/')
        b = responses[event, response]
        assert len(b) == 1
        r = b[0]
        p = min(100, max(0, p + int(r['P'])))
        t += int(r['Min'])
        pm += 6 * int(r['Min'])
        if r['CB'] != '—':
            scheduled_turn = turn + 2
        if event in callbacks:
            assert turn == scheduled_turn == int(row['Due draw'])
    assert (p, t, pm) == (int(row['Final P']), int(row['T']), int(row['pm']))

def utility(r):
    return Fraction(int(r['P'])) - Fraction(6, 5) * int(r['Min'])

expected = {}
for event, rid in [('menu-needs', 'invite'), ('quick-agreement', 'refocus'), ('spice-question', 'timebox')]:
    b = responses[event, rid]
    u = sum(int(r['Weight']) * utility(r) for r in b) / sum(int(r['Weight']) for r in b)
    all_u = [sum(int(r['Weight']) * utility(r) for r in rows) / sum(int(r['Weight']) for r in rows)
             for (e, response), rows in responses.items() if e == event]
    expected[event] = (u, (u - min(all_u)) / (max(all_u) - min(all_u)))
assert expected == {'menu-needs': (Fraction(124, 25), Fraction(77, 150)),
                    'quick-agreement': (Fraction(147, 25), Fraction(0)),
                    'spice-question': (Fraction(128, 15), Fraction(73, 96))}

# Audit the review handoff's counterexamples to universal dominance, branch by branch.
def clamped_document_utility(event, response, progress, headcount):
    b = responses[event, response]
    weighted = sum(int(r['Weight']) * (
        min(100, max(0, progress + int(r['P']))) - progress
        - Fraction(1, 5) * headcount * int(r['Min'])) for r in b)
    return weighted / sum(int(r['Weight']) for r in b)

assert clamped_document_utility('menu-needs', 'invite', 94, 6) == Fraction(-26, 25)
assert clamped_document_utility('menu-needs', 'hear', 94, 6) == Fraction(-6, 5)
assert clamped_document_utility('menu-needs', 'park', 94, 6) == Fraction(-6, 5)
assert clamped_document_utility('quick-agreement', 'refocus', 99, 7) == Fraction(-206, 25)
assert clamped_document_utility('quick-agreement', 'hear', 99, 7) == Fraction(-44, 5)
assert responses['quick-agreement', 'invite'][0]['Requires'] == 'absent: vp'

# Relative references and table formatting in all L02/authority documents.
def heading_id(line):
    text = re.sub(r'[`*_]', '', line.lstrip('# ').strip()).lower()
    return re.sub(r'[^\w\- ]', '', text).replace(' ', '-')

paths = [SOURCE, ROOT / 'docs/content-table-launch.md', ROOT / 'docs/lunch-playtest.md',
         ROOT / 'docs/implementation-plan.md', ROOT / 'docs/design-doc-v2.md',
         ROOT / 'docs/tech-spec.md', ROOT / 'docs/lunch-redesign-plan.md',
         ROOT / 'docs/lunch-writing-review.md', ROOT / 'CLAUDE.md', ROOT / 'README.md'] + list((ROOT / 'docs/adr').glob('*.md'))
links = 0
if (ROOT / 'docs/lunch-writing-review-report.md').exists():
    paths.append(ROOT / 'docs/lunch-writing-review-report.md')
for name in ['L02b-review.md', 'L02b-review-resolution.md']:
    if (ROOT / 'docs' / name).exists():
        paths.append(ROOT / 'docs' / name)
paths += [ROOT / 'docs/design-doc-launch.md', ROOT / 'docs/L02-review.md',
          ROOT / 'docs/L02-review-resolution.md']
for path in paths:
    text = path.read_text(encoding='utf-8')
    list(tables(text))
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if re.match(r'(https?://|mailto:)', target):
            continue
        filename, _, anchor = target.partition('#')
        destination = path.parent / filename if filename else path
        assert destination.exists(), (path.name, target, 'missing file')
        if anchor:
            anchors = {heading_id(x) for x in destination.read_text(encoding='utf-8').splitlines() if x.startswith('#')}
            assert anchor in anchors, (path.name, target, 'missing heading')
        links += 1
assert all('Status: **Accepted by Harry on October 13, 2026.**' in (ROOT / 'docs/adr' / name).read_text(encoding='utf-8')
           for name in ['0005-lunch-agreement-and-attendance.md', '0006-lunch-response-outcomes.md',
                        '0007-lunch-score-and-policies.md', '0008-lunch-presentation-and-unlocks.md'])
assert 'V4 remains pending' in TEXT
for filename in ['contentTableValidation.test.ts', 'liveContent.test.ts']:
    source = (ROOT / 'scripts' / filename).read_text(encoding='utf-8')
    assert "new URL('../docs/content-table-launch.md', import.meta.url)" in source
    assert "new URL('../docs/content-table.md', import.meta.url)" not in source
assert "new URL('../docs/design-doc-launch.md', import.meta.url)" in (
    ROOT / 'scripts/liveContent.test.ts').read_text(encoding='utf-8')
launch_headers = [ROOT / 'src/core/content/engineRules.ts'] + list((ROOT / 'src/core/content/events').glob('*.ts'))
assert len(launch_headers) == 22
assert all('// Approved docs/content-table-launch.md' in p.read_text(encoding='utf-8') for p in launch_headers)
claude = (ROOT / 'CLAUDE.md').read_text(encoding='utf-8').strip()
spec = (ROOT / 'docs/tech-spec.md').read_text(encoding='utf-8')
assert claude == spec.split('**Drop-in `CLAUDE.md`**')[1].split('```markdown\n')[1].split('\n```')[0].strip()
print(f'PASS: {len(base)} base families, {len(callbacks)} callbacks, filler, {len(presentations)} presentations')
print(f'PASS: {len(responses)} choices, {sum(map(len, responses.values()))} outcome rows, 3 uncertain choices')
print(f'PASS: {len(lengths)} copy cells, {rendered_count} complete catalog substitutions, 12 titles, 7 commentary rows')
print('PASS: 3 complete walkthrough running sums, 3 callback mini-routes, 3 exact expected-utility/quality examples')
print(f'PASS: table structure in {len(paths)} documents, {links} relative file/heading references, accepted ADR statuses')
print('PASS: launch test/provenance source paths and exact CLAUDE/spec mirror')
print('PASS: two clamped-state counterexamples; no universal gamble-dominance claim')

# Optional Git-backed editorial audit: replay both wording logs, then compare all
# cells. This detects unlogged copy changes as well as any mechanical change.
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--review-base', help='Git revision of the initial L02b input')
args = parser.parse_args()
if args.review_base:
    old_text = subprocess.check_output(
        ['git', 'show', '--end-of-options', args.review_base + ':docs/content-table.md'],
        cwd=ROOT).decode('utf-8')
    old_rows = list(tables(old_text))
    report_rows = list(tables((ROOT / 'docs/lunch-writing-review-report.md').read_text(encoding='utf-8')))
    assert len(old_rows) == len(ROWS) == 287
    copy_fields = {'Opening line', 'Label', 'Description', 'Outcome line', 'Copy',
                   'Flavour line', 'Line', 'Name', 'Role', 'Voice / comic friction'}
    for (section, _, before), (new_section, _, after) in zip(old_rows, ROWS):
        assert section == new_section and list(before) == list(after)
        assert {k: v for k, v in before.items() if k not in copy_fields} == {
            k: v for k, v in after.items() if k not in copy_fields}, section

    coverage = {r['Group']: r for _, _, r in report_rows if 'Presentations reviewed' in r}
    assert set(coverage) == set(families)
    for event in families:
        assert set(coverage[event]['Presentations reviewed'].split(', ')) == {
            r['Presentation'] for s, r in presentations if s == event}
        assert set(coverage[event]['Every response/outcome reviewed'].split(', ')) == {
            response + '/' + r['Outcome'] for (e, response), branches in responses.items()
            if e == event for r in branches}
    catalog_coverage = [r for _, _, r in report_rows if 'Every reviewed key / ID' in r]
    for section, key, guard in [
        ('Cuisine catalog', 'ID', 'ID'), ('Attendees and voice guide', 'ID', 'ID'),
        ('Disabled reasons', 'Key', 'Key'), ('Title catalog', 'ID', 'Slot'),
        ('Epilogues and factual moments', 'Key', 'Ending'),
        ('Epilogues and factual moments', 'Event / park response', 'Event / park response'),
        ('Epilogues and factual moments', 'Key', 'Use'),
        ('Interface, results and share copy', 'Key', 'Key'),
        ('Fourth-wall commentary', 'ID', 'Priority')]:
        expected_keys = {r[key] for s, _, r in ROWS if s == section and guard in r}
        group = section + ' (' + str(len(expected_keys)) + ')'
        assert any(r['Group'] == group and
                   set(r['Every reviewed key / ID'].split(', ')) == expected_keys
                   for r in catalog_coverage), ('catalog coverage', section, guard)

    reconstructed = [(s, dict(r)) for s, _, r in old_rows]
    logs = [r for _, _, r in report_rows if 'Before' in r]
    assert len(logs) == 57  # 45 initial edits, then 12 reviewed follow-ups.
    for log in logs:
        parts = log['Address'].split('/')
        assert len(parts) in {2, 3} and log['Field'] in copy_fields
        matched = []
        for section, row in reconstructed:
            identity = row.get('Response', row.get('Presentation', row.get('ID', row.get('Key'))))
            if (section == parts[0] and identity == parts[1]
                    and (len(parts) == 2 or row.get('Outcome') == parts[2])
                    and row.get(log['Field']) == log['Before']):
                matched.append(row)
        assert matched, ('unmatched change log', log['Address'], log['Field'])
        for row in matched:
            row[log['Field']] = log['After']
    assert reconstructed == [(s, r) for s, _, r in ROWS], 'unlogged table change'
    print('PASS: L02b report covers all presentations, branches and catalog keys')
    print('PASS: 287 rows preserve mechanics; 57 sequential wording edits reconstruct the complete table')
