# NutriKlik Database Backup Service

Automated daily PostgreSQL backup to Google Drive, running as a Railway cron service.

## Prerequisites

- Google Cloud project with Drive API enabled
- Google Service Account with a JSON key
- A Google Drive folder shared with the service account email

## Setup Steps

### 1. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services → Library**
4. Search for **Google Drive API** and **Enable** it
5. Navigate to **APIs & Services → Credentials**
6. Click **Create Credentials → Service Account**
   - Name: `nutriklik-backup`
   - Role: none needed (it only accesses shared folders)
7. Click on the created service account → **Keys** tab
8. **Add Key → Create new key → JSON** → Download the JSON file
9. Copy the `client_email` from the JSON (e.g. `nutriklik-backup@project.iam.gserviceaccount.com`)

### 2. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a folder: `NutriKlik Backups`
3. Right-click → **Share** → Add the service account email from step 1.9
4. Set permission to **Editor**
5. Open the folder → copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### 3. Deploy on Railway

1. In your Railway project, click **New → Service**
2. Select **GitHub Repo** → choose the same repo
3. In the new service settings:
   - **Root Directory**: `backup-service`
   - **Builder**: Dockerfile
4. Go to **Settings → Cron Schedule**:
   ```
   0 19 * * *
   ```
   > This is 19:00 UTC = 02:00 WIB (next day)
5. Add **Environment Variables**:

   | Variable                 | Value                                                                                       |
   | ------------------------ | ------------------------------------------------------------------------------------------- |
   | `DATABASE_URL`           | Same as your main app (Railway internal URL recommended, e.g. `${{Postgres.DATABASE_URL}}`) |
   | `GOOGLE_SERVICE_ACCOUNT` | Paste the **entire** JSON key file content as a single string                               |
   | `GOOGLE_DRIVE_FOLDER_ID` | The folder ID from step 2.5                                                                 |
   | `BACKUP_RETENTION_DAYS`  | `30` (optional, default 30)                                                                 |

6. Click **Deploy**

### 4. Verify

After the first scheduled run (or trigger manually via Railway dashboard → **Deploy** button):

1. Check Railway logs for the backup service — you should see:
   ```
   🔄 Starting database backup: nutriklik-backup-2026-04-05T02-00-00.sql.gz
   ✅ Dump completed: X.XX MB
   📤 Uploading to Google Drive...
   ✅ Uploaded: nutriklik-backup-... — ID: xxxxx
   🎉 Backup completed successfully!
   ```
2. Check your Google Drive folder — backup file should appear

### 5. Cost

- Railway cron services only bill for execution time (typically < 1 minute per backup)
- Google Drive: 15 GB free storage
- With 30-day retention and typical app DB (~5-20 MB compressed), you'll use < 1 GB

## Manual Backup

To manually trigger a backup from Railway:

1. Go to the backup service in Railway dashboard
2. Click the three dots menu → **Trigger Cron**

## Restore

To restore from a backup:

```bash
# Download the backup from Google Drive
# Then decompress and restore:
gunzip -c nutriklik-backup-YYYY-MM-DDTHH-MM-SS.sql.gz | psql "$DATABASE_URL"
```
