# Incrypt Arena – Feature & Modification Requirements

---

## Overview

This document outlines the feature requirements and modifications for Incrypt Arena, organized into two main sections:

1. **Normal User Modifications** – Features accessible to regular users
2. **Admin Panel Modifications** – Features accessible to administrators

---

## General UI/UX Requirements

- **All URLs must be clickable** and open in a new tab/window
- This applies to all links displayed in tables, modals, and detail views:
  - Course URLs
  - Blog URLs
  - Notes URLs
  - Slides URLs
  - Evaluation URLs
  - Recording URLs
  - Book URLs

---

# PART 1: NORMAL USER MODIFICATIONS

---

## 1. Authentication & User Management

### 1.1 User Login

- Each user must log in using **email-based authentication**
- Email must be **unique**

### 1.2 User Table Changes

Add the following fields:

- `email`
- `far_away` (Boolean)
  - If `true`, **attendance points and early bird points are doubled**
- Remove **Askora Special Streak** logic entirely

---

## 2. New Tab: My Achievements

This page is split into **two sections**:

---

### 2.1 Upper Section – Add Achievements

Three buttons:

- ➕ Add Course
- ➕ Add Book
- ➕ Add Blog

Each button opens a modal.

---

### 2.2 Lower Section – Performance Tabs

Eight tabs, each showing a **table view**:

1. Attendance
2. Activities
3. Presentations
4. Courses
5. Books
6. Blogs
7. Penalties
8. Rewards
   - Includes:
     - Ideas
     - Attendance Champion

#### Table Actions

- **Edit & Delete buttons** for:
  - Courses
  - Books
  - Blogs

---

## 3. Achievement Modal Modifications

### 3.1 Add Course Modal

Fields:

- Course Name
- Course URL
- Notes URL
- Number of Hours
- Completion Percentage

---

### 3.2 Add Book Modal

- User must **select a book from the Books Library**
- Flow:
  1. Select **Category**
  2. Select **Book from that category**
- **Points per page are NOT editable**
- Points calculated automatically

---

### 3.3 Add Blog Modal

Fields:

- Blog Name
- Blog URL

System must:

- Detect if this is the user's **first blog**
- Apply first-blog logic automatically
- Prevent duplicate blog links per user

---

## 4. Team Achievements Page

Contains **4 tabs**:

---

### 4.1 Courses Tab

Fields:

- Course Name
- Team Member Name
- Course URL
- Notes URL
- Number of Hours
- Completion Percentage

---

### 4.2 Blogs Tab

Fields:

- Blog Name
- Team Member Name
- Blog URL

---

### 4.3 Books Tab

Fields:

- Book Name
- Team Member Name
- Number of Pages
- Notes URL
- Book URL (optional)

---

### 4.4 Presentations Tab

Fields:

- Presentation Name
- Team Member(s) Name(s)
- Slides URL
- Evaluation URL
- Recording URL (optional)

---

# PART 2: ADMIN PANEL MODIFICATIONS

---

## 5. Points & Performance Management

### 5.1 Top Performer

**Add Top Performer Modal Fields:**

- User Selection (dropdown)
- Custom Points (number input)
- Reason/Description (optional text field)

**Requirements:**

- Remove fixed `20 points` restriction
- Admin can assign any custom point value

### 5.2 Attendance & Early Bird

- If `far_away = true` → attendance points ×2 and early bird points ×2

---

## 6. Books Library (New Admin Tab)

### 6.1 Add Book Modal

**Modal Fields:**

- Book Name (required, text input)
- Category (required, dropdown or text input)
- Points per 10 pages (required, number input)

**Actions:**

- Save button
- Cancel button

---

### 6.2 Edit Book Modal

**Modal Fields:**

- Book Name (pre-filled, editable)
- Category (pre-filled, editable)
- Points per 10 pages (pre-filled, editable)

**Actions:**

- Update button
- Cancel button

---

### 6.3 Books List View

- 📋 **Table showing all books** with columns:
  - Book Name
  - Category
  - Points per 10 pages
  - Actions (Edit, Delete)
- ✏️ **Edit button** → Opens Edit Book Modal
- 🗑 **Delete button** → Confirmation dialog before deletion

---

## 7. Presentations Management

### 7.1 Add Presentation Modal

**Modal Fields:**

- Presentation Name (required, text input)
- Participant(s) (required, multi-select dropdown - supports 1 or 2 participants)
- Presentation Date (required, date picker)
- Slides URL (optional, text input)
- Evaluation URL (optional, text input)
- Recording URL (optional, text input)
- **Is First Presentation** checkbox per participant

**Points Calculation Logic:**

| Scenario            | Points |
| ------------------- | ------ |
| Solo + First        | 30     |
| Solo + Not First    | 20     |
| Partner + First     | 20     |
| Partner + Not First | 15     |

**Important:**

- Points calculated automatically based on number of participants and first presentation status

**Actions:**

- Save button
- Cancel button

---

### 7.2 Edit Presentation Modal

**Modal Fields:**

- Presentation Name (pre-filled, editable)
- Participant(s) (pre-filled, editable)
- Presentation Date (pre-filled, editable)
- Slides URL (pre-filled, editable)
- Evaluation URL (pre-filled, editable)
- Recording URL (pre-filled, editable)
- Points (recalculated automatically, display only)

**Actions:**

- Update button
- Cancel button

---

### 7.3 Presentations List View

- **Table showing all presentations** with columns:
  - Presentation Name
  - Participant(s)
  - Date
  - Points
  - Actions (Edit, Delete)
- Sorted by **date (descending)**
- Each row:
  - ✏️ Edit button → Opens Edit Presentation Modal
  - 🗑 Delete button → Confirmation dialog before deletion

---

## 8. Blogs Management (Admin)

### 8.1 Edit Blog Modal

**Modal Fields:**

- Blog Name (pre-filled, editable)
- Blog URL (pre-filled, editable)
- User/Author (display only, not editable)
- Is First Blog (display only, system-calculated)
- Points (display only, system-calculated)

**Actions:**

- Update button
- Cancel button

---

### 8.2 Blogs List View

- **Table showing all blogs** with columns:
  - Blog Name
  - Blog URL (clickable)
  - User/Author Name
  - Is First Blog (Yes/No)
  - Points
  - Date Added
  - Actions (Edit)
- Each row:
  - ✏️ Edit button → Opens Edit Blog Modal
- Filter/search optional (future-ready)

---

## 9. Ideas Management

### 9.1 Add Idea Modal

**Modal Fields:**

- User Selection (required, dropdown)
- Idea Title/Name (required, text input)
- Idea Description (optional, text area)
- Custom Points (required, number input)
- Date (optional, date picker - defaults to current date)

**Actions:**

- Save button
- Cancel button

---

### 9.2 Edit Idea Modal

**Modal Fields:**

- User (display only or editable based on business rules)
- Idea Title/Name (pre-filled, editable)
- Idea Description (pre-filled, editable)
- Custom Points (pre-filled, editable)
- Date (pre-filled, editable)

**Actions:**

- Update button
- Cancel button

---

### 9.3 Ideas List View

- **Table showing all ideas** with columns:
  - Idea Title
  - User Name
  - Description
  - Points
  - Date
  - Actions (Edit, Delete)
- Each row:
  - ✏️ Edit button → Opens Edit Idea Modal
  - 🗑 Delete button → Confirmation dialog before deletion

---

## 10. User Management (Admin)

### 10.1 Edit User Modal

**Modal Fields:**

- User Name (display only)
- Email (pre-filled, editable)
- Far Away Status (checkbox or toggle)
  - Label: "Lives Far Away (2x points for attendance & early bird)"
- Role/Permissions (if applicable)

**Actions:**

- Update button
- Cancel button

---

### 10.2 Users List View

- **Table showing all users** with columns:
  - User Name
  - Email
  - Far Away Status (Yes/No or ✓/✗)
  - Total Points
  - Actions (Edit)
- Each row:
  - ✏️ Edit button → Opens Edit User Modal

---

# PART 3: SYSTEM & DATA REQUIREMENTS

---

## 11. Data Integrity & Rules

- Prevent duplicate blog links per user
- Automatically detect:
  - First blog
  - First presentation
- **All URLs must be clickable** (opens in new tab/window)

---

## 12. Suggested Database Additions (High-Level)

### New / Updated Tables

- `users` (email, far_away)
- `books_library` (name, category, points_per_10_pages)
- `blogs` (name, url, user_id, is_first)
- `courses` (name, url, notes_url, hours, completion_percentage, user_id)
- `presentations` (name, participants, date, slides_url, evaluation_url, recording_url, is_first_per_participant)
- `ideas` (name, description, user_id, points)
- `team_achievements` (linking table for shared achievements)

---

## 13. Optional Enhancements (Future)

- Filters on admin lists
- Notifications on achievements
- for users Add attendance champion leaderboard
- for admins add attendance tab to edit any week
