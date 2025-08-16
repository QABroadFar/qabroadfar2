# QA Portal Project

Ini adalah proyek portal QA yang dibangun dengan Next.js, TypeScript, dan SQLite. Proyek ini bertujuan untuk mengelola alur kerja Non-Conformance Product (NCP) dari awal hingga akhir.

## Tumpukan Teknologi (Technology Stack)

*   **Framework:** Next.js
*   **Bahasa:** TypeScript
*   **Database:** SQLite (dengan `better-sqlite3`)
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Authentikasi:** JWT (JSON Web Tokens)
*   **Charting:** Chart.js

## Peta Konsep & Arsitektur (Concept Map & Architecture)

Berikut adalah gambaran umum arsitektur dan struktur proyek ini:

### Frontend (`/app` dan `/components`)
-   **Struktur Halaman:** Aplikasi menggunakan App Router dari Next.js. Halaman utama berada di direktori `/app`.
    -   `/app/login`: Halaman untuk masuk ke sistem.
    -   `/app/dashboard`: Halaman utama setelah login, yang berfungsi sebagai layout untuk semua halaman internal.
    -   `/app/dashboard/*`: Halaman-halaman spesifik yang di-render di dalam dashboard, seperti `user-management`, `analytics`, dll.
-   **Komponen UI:** Komponen yang dapat digunakan kembali (seperti `Button`, `Table`, `Dialog`) berada di `/components/ui`. Komponen spesifik untuk dashboard (seperti `AppSidebar`, `NCPInputForm`) berada di `/app/dashboard/components`.
-   **Logika Frontend:** Logika state management dan interaksi dengan API ditangani di dalam masing-masing komponen halaman menggunakan React hooks (`useState`, `useEffect`).

### Backend (`/app/api`)
-   **API Routes:** Backend dibangun menggunakan API Routes dari Next.js. Semua endpoint API berada di direktori `/app/api`.
    -   `/app/api/auth`: Menangani autentikasi (login, logout, get user info).
    -   `/app/api/ncp`: Menangani semua operasi terkait NCP (list, create, approve, details).
    -   `/app/api/users`: Menangani manajemen pengguna oleh `super_admin`.
    -   `/app/api/analytics`, `/app/api/audit-log`, dll: Menyediakan data untuk fitur-fitur `super_admin`.
-   **Middleware:** Logika untuk memverifikasi token JWT (`verifyAuth`) digunakan di setiap endpoint yang memerlukan autentikasi untuk melindungi rute.

### Database (`/lib` dan `qa_portal.db`)
-   **File Database:** Menggunakan SQLite, dengan file database `qa_portal.db` di root proyek.
-   **Skema & Fungsi:** Logika untuk skema database, koneksi, dan semua fungsi CRUD (Create, Read, Update, Delete) didefinisikan di `lib/database.ts`.
-   **Tabel Utama:**
    -   `users`: Menyimpan data pengguna, peran, dan status.
    -   `ncp_reports`: Tabel utama yang menyimpan semua data laporan NCP.
    -   `notifications`: Menyimpan notifikasi untuk pengguna.
    -   `ncp_audit_log`, `system_logs`, `api_keys`: Tabel untuk mendukung fitur `super_admin`.

#### Struktur Data Tabel

**1. `users`**
-   `id`: INTEGER (Primary Key)
-   `username`: TEXT (Unique)
-   `password`: TEXT (Hashed)
-   `role`: TEXT (e.g., 'user', 'qa_leader', 'super_admin')
-   `full_name`: TEXT
-   `is_active`: BOOLEAN
-   `created_at`: DATETIME

**2. `ncp_reports`**
-   `id`: INTEGER (Primary Key)
-   `ncp_id`: TEXT (Unique)
-   `sku_code`, `machine_code`, `date`, `time_incident`, `hold_quantity`, `hold_quantity_uom`, `problem_description`, `photo_attachment`: Data utama laporan.
-   `status`: TEXT (e.g., 'pending', 'qa_approved', 'manager_approved')
-   `submitted_by`: TEXT (Username pengirim)
-   `qa_leader`, `assigned_team_leader`: Penugasan ke peran terkait.
-   Berisi banyak kolom untuk setiap tahap persetujuan (e.g., `qa_approved_by`, `tl_processed_at`, `root_cause_analysis`, dll).

**3. `notifications`**
-   `id`: INTEGER (Primary Key)
-   `user_id`: INTEGER (Foreign Key ke `users.id`)
-   `ncp_id`: TEXT
-   `title`, `message`, `type`: Konten notifikasi.
-   `is_read`: BOOLEAN

**4. `ncp_audit_log`**
-   `id`: INTEGER (Primary Key)
-   `ncp_id`: TEXT
-   `changed_by`: TEXT (Username yang mengubah)
-   `field_changed`, `old_value`, `new_value`, `description`: Detail perubahan.
-   `changed_at`: DATETIME

**5. `system_logs`**
-   `id`: INTEGER (Primary Key)
-   `level`: TEXT ('info', 'warn', 'error')
-   `message`: TEXT
-   `details`: TEXT (JSON)
-   `created_at`: DATETIME

**6. `api_keys`**
-   `id`: INTEGER (Primary Key)
-   `key`: TEXT (Unique)
-   `service_name`: TEXT
-   `permissions`: TEXT (JSON array)
-   `is_active`: BOOLEAN
-   `created_at`, `last_used_at`: DATETIME

### Skrip (`/scripts`)
-   Direktori ini berisi skrip-skrip Node.js untuk tugas-tugas administratif.
    -   `init-database.js`: Untuk membuat skema tabel dan mengisi data pengguna awal (seeding).
    -   `backup-db.js` & `restore-db.js`: Untuk mencadangkan dan memulihkan database.

## Alur Proses (Process Flow)

Alur kerja NCP di dalam sistem ini adalah sebagai berikut:

1.  **Pengajuan NCP:** Pengguna dengan peran `user` dapat membuat laporan NCP baru.
2.  **Persetujuan QA Leader:** Laporan yang diajukan akan ditinjau oleh `qa_leader`. QA Leader dapat menyetujui, menolak, atau menugaskan laporan ke `team_leader`.
3.  **Proses Team Leader:** `team_leader` yang ditugaskan akan melakukan analisis akar masalah (RCA) dan menentukan tindakan korektif dan preventif.
4.  **Persetujuan Process Lead:** Setelah diproses oleh Team Leader, laporan akan ditinjau oleh `process_lead`.
5.  **Persetujuan QA Manager:** Setelah disetujui oleh Process Lead, laporan akan ditinjau oleh `qa_manager` untuk persetujuan akhir.
6.  **Selesai:** Setelah disetujui oleh QA Manager, laporan dianggap selesai dan diarsipkan.

## Pengguna Default (Default Users)

Untuk tujuan pengembangan dan pengujian, sistem ini dilengkapi dengan beberapa pengguna default.

| Username     | Password      | Role          |
|--------------|---------------|---------------|
| `superadmin` | `123`         | `super_admin` |
| `admin`      | `password123` | `admin`       |
| `qaleader1`  | `password123` | `qa_leader`   |
| `teamlead1`  | `password123` | `team_leader` |
| `processlead1`| `password123` | `process_lead`|
| `qamanager1` | `password123` | `qa_manager`  |
| `user1`      | `password123` | `user`        |

**Catatan:** Untuk membuat pengguna ini, jalankan skrip inisialisasi database dengan perintah `node scripts/init-database.js`.

## Peran Super Admin

Peran `super_admin` memiliki akses tertinggi di sistem dan dapat melakukan hal berikut:
*   Mengelola pengguna (menambah, mengubah peran, mereset kata sandi, menonaktifkan).
*   Mengelola laporan NCP tanpa batasan status (edit, revert, reassign).
*   Melihat dasbor analitik.
*   Melihat log audit dan log sistem.
*   Mengelola kunci API.
*   Melakukan backup dan restore database.
