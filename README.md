# Nexus App Suite · Portfolio

A one-page portfolio of the **Nexus app suite** by Christian Sevilleno, freelance developer:

- **NexusHub**: the employee platform and sign-in provider. It covers employee records, leave, attendance, request forms with approvals, onboarding and offboarding, meetings, a company feed, roles and OpenID Connect sign-in.
- **NexusInventory**: IT asset inventory. It covers assets and components, assignments, QR labels, purchase orders and offboarding clearance. Employees sign in through the Hub, and their records sync from it.
- **NexusProject**: project management. It covers projects, their teams and clients, milestones, progress taken from the project's tasks in NexusTask, status movement, a timetable and delivery reports.
- **NexusTask**: the task manager. It covers personal and team lists, boards, the company workflow, project tasks, a calendar, comments with mentions, attachments and Hub notifications.
- **NexusAttendance**: the face clock-in kiosk. A tablet at the entrance matches an enrolled face and asks for a blink, then records the punch. It covers consent and enrollment, kiosk pairing, punch review and "My punches". Punches go to the Hub's attendance sheet as events.

Every screenshot uses fictional sample data. The kiosk camera shows a plain silhouette, not a real face.

## View it

Open `index.html` in a browser, or publish it with GitHub Pages: **Settings › Pages › Build and deployment › Deploy from a branch**, branch `main`, folder `/ (root)`. The site then appears at `https://<user>.github.io/nexus-suite-portfolio/`.

It is a plain static site (HTML, CSS and a few lines of JavaScript), with no build step.
