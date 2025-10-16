from datetime import datetime, timedelta
import uuid

# Prompt titles (Seth Godin's 65 notes rephrased as reminders)
journal_prompts = [
    "The system can be changed and normal is not permanent",
    "Find the smallest viable audience",
    "Pick your customers, pick your future",
    "Outdated maps might be worth less than no map at all",
    "Reliability is a superpower",
    "There are no side effects, merely effects",
    "There’s usually an opportunity to be of service",
    "Silence is an option, and so is leadership",
    "There is no perfect moment to begin",
    "Shame is a dream killer",
    "Everyone who disagrees with you believes they are correct",
    "Ship the work",
    "Treat different people differently",
    "I am not stuck in traffic, I am traffic",
    "Invest in slow growth",
    "The problem with the race to the bottom is you might win",
    "Uncomfortable facts are often the most helpful ones",
    "A good deal is better than a big deal",
    "When in doubt look for the fear",
    "Avoid arguments, embrace conversations",
    "Easy to measure doesn’t make it important",
    "Find clarity about who the customer is (and isn’t)",
    "Genre is a platform, not a fence",
    "Lowering expectations can increase satisfaction",
    "Improve project hygiene",
    "Ask what the system is for",
    "We might not need more time, we simply need to decide",
    "Consider the cost of keeping a promise before making it",
    "Earn enrollment",
    "Helping someone get what they want is easier than changing what they want",
    "Not all criticism is equally valid",
    "Write down the things you’re sure you’ll never forget",
    "Focus on the hard part",
    "Quitting one thing is the only way to find the focus to do the next thing",
    "Perfectionism is not related to quality",
    "Your competitors are actually your allies",
    "Surfing is better than golf",
    "Criticize ideas, not people",
    "Cannibals rarely get a good night’s sleep",
    "Status roles are the unseen force in almost every system",
    "Embrace necessary discomfort",
    "Gratitude is a more useful fuel than anger",
    "Create tension and relieve stress",
    "Imposter syndrome is real, and it arrives whenever we’re doing important work",
    "Solve interesting problems",
    "Offer dignity",
    "Ignore sunk costs",
    "Don’t try to fill an unfillable hole",
    "This might not work",
    "Consistency is more useful than authenticity",
    "People like us do things like this",
    "Simple hacks rarely fix long-term problems",
    "Trade short-term wins for long-term impact",
    "Today’s world is unpredictable, and this is as stable as it will ever be again",
    "Generous doesn’t mean free",
    "Make assertions",
    "Invest in skills that compound with effort",
    "Culture conceals systems, and systems construct our future",
    "Peeves make lousy pets",
    "Reassurance is futile",
    "Take responsibility, demand freedom, don’t seek authority",
    "Ideas that spread, win",
    "Earn trust through action",
    "Become the person your future thanks you for and forgive the past for the mistakes it made",
    "Attitudes are skills"
]

start_date = datetime(2025, 7, 31)

ics_lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "CALSCALE:GREGORIAN", "PRODID:-//Seth Godin Journal Prompts//Set by User//EN"]

for i, prompt in enumerate(journal_prompts):
    event_date = start_date + timedelta(days=i)
    dtstart = event_date.strftime('%Y%m%d')
    dtend = (event_date + timedelta(days=1)).strftime('%Y%m%d')
    alarm_time = event_date.replace(hour=8, minute=30).strftime('%Y%m%dT083000')
    uid = str(uuid.uuid4())
    ics_lines.extend([
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTART;VALUE=DATE:{dtstart}",
        f"DTEND;VALUE=DATE:{dtend}",
        f"SUMMARY:{prompt}",
        "TRANSP:TRANSPARENT",
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "BEGIN:VALARM",
        "TRIGGER;VALUE=DATE-TIME:{}Z".format(
            (event_date.replace(hour=8, minute=30)).strftime('%Y%m%dT153000Z') # 08:30 AM PDT == 15:30Z
        ),
        "ACTION:DISPLAY",
        f"DESCRIPTION:{prompt}",
        "END:VALARM",
        "END:VEVENT"
    ])
ics_lines.append("END:VCALENDAR")

# Save to file
temp_filename = "seth_godin_journal_prompts.ics"
with open(temp_filename, "w") as f:
    f.write("\n".join(ics_lines))

temp_filename
