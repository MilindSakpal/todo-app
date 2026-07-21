Design a premium, modern, enterprise-grade desktop web application UI for a timesheet management system called **"Intellysis Time Sheet"**. The design should feel like a combination of Linear, Notion, Stripe Dashboard, Asana, ClickUp, and Framer, with a clean SaaS aesthetic, minimal layout, generous white space, soft shadows, rounded corners (16px), subtle borders, glass-like cards, and premium typography (Inter). Use a white background with Primary Blue (#1E88E5), Light Gray (#F8FAFC), Green (#16A34A), Orange (#F59E0B), Red (#EF4444), and Purple (#8B5CF6). The interface must look like a real enterprise product ready for production.

Remove the traditional left sidebar completely. Instead, create a clean top navigation bar. On the left place the Intellysis logo and the title "Intellysis Time Sheet". In the center display today's date. On the right display the employee profile with circular avatar, employee name, designation, notification icon, and profile dropdown.

Below the navigation, display a welcome section with "Good Morning, John 👋" followed by "Here's your productivity overview for today."

Below that create four modern statistic cards in a single row:
• Total Hours Logged Today
• Active Projects
• Today's Tasks
• Completed Tasks

Each card should contain a modern icon, large value, small description, soft shadow, hover animation, and subtle gradient.

The main content should use a 70/30 split layout.

The left section contains a large "Today's Time Sheet" card with a modern table.

The table columns should include:
• Task Name
• Project
• Category
• Start Time
• End Time
• Duration (Auto Calculated)
• Status
• Actions

Status chips:
Green = Completed
Orange = Pending
Purple = In Review
Red = Rejected

Each row should have Edit and Delete icons.

Above the table include:
• Search Bar
• Filter Button
• Sort Dropdown
• + Add Entry Button

Below the table display Total Logged Hours for the selected day.

The right panel should contain three modern cards.

Card 1:
Large Interactive Calendar.

Features:
• Month Navigation
• Today Highlight
• Hover Effects
• Selected Date Highlight
• Smooth Click Animation

Important Interaction:

Whenever the employee clicks ANY previous date or future date on the calendar, the entire dashboard should instantly filter itself and display only the tasks performed on that selected date.

For example:

User clicks "10 July"

Immediately refresh the Timesheet Table with all work performed on 10 July.

Display

09:30 AM
Website UI Design

11:15 AM
Client Meeting

01:00 PM
Lunch Break

02:00 PM
Excel Reporting

04:30 PM
Testing

06:00 PM
Documentation

If no task exists for the selected date, display a beautiful empty state illustration with the message:

"No work logged for this day."

Keep the selected date highlighted until another date is selected.

Animate table refresh smoothly (300ms fade + slide).

Card 2:
Weekly Productivity Summary

Display a modern circular progress chart showing:
• Total Hours
• Completed Hours
• Pending Hours
• Overtime Hours

Include percentage indicators and color-coded legend.

Card 3:
Excel Integration

Display:

Connection Status

Connected Excel File

Last Sync Time

Auto Sync Status

Buttons:

Export to Excel

Sync Now

Import Excel

Display a green success indicator when synced.

Create a floating "+ Add Entry" modal.

Fields include:

Task Name

Project

Category

Description

Date Picker

Start Time

End Time

Duration (Automatically Calculated)

Status Dropdown

Completed

Pending

Rejected

In Review

Upload Attachment

Save

Cancel

Filters available:

Date

Project

Status

Department

Employee

Category

Search Task

Create modern empty states, loading skeletons, hover effects, ripple button animations, subtle page transitions, soft shadows, and premium UI micro-interactions.

Use a 12-column grid with 24px spacing and 24px internal padding.

Desktop width: 1440px.

Responsive layouts for Tablet (1024px) and Mobile (390px).

Include Dark Mode compatibility.

Future-ready features:

• Auto Start/Stop Timer
• Attendance Heatmap (GitHub Style)
• Daily Productivity Score
• Weekly Performance Graph
• Overtime Indicator
• Missing Timesheet Reminder
• Manager Approval Workflow
• Team Lead Approval
• HR Approval
• Comments on Rejected Entries
• Audit Log
• Version History
• Draft Auto Save
• Excel Auto Import
• Excel Auto Export
• Real-Time Sync
• Notification Center
• Employee Activity Timeline

The overall design should feel premium, elegant, modern, enterprise-ready, minimal, highly usable, visually balanced, and suitable for a professional corporate environment. The final result should look like a polished SaaS product that could realistically compete with ClickUp, Monday.com, Asana, or Jira, with pixel-perfect spacing, consistent typography, and a world-class UI/UX.