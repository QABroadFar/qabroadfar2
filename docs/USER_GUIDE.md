# Quality Assurance Portal User Guide

Last Updated: September 6, 2025

## Table of Contents
1. [Getting Started](#getting-started)
2. [Login and Authentication](#login-and-authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [NCP Report Workflow](#ncp-report-workflow)
5. [Role-Specific Features](#role-specific-features)
6. [System Administration](#system-administration)
7. [Reporting and Analytics](#reporting-and-analytics)
8. [Troubleshooting](#troubleshooting)

## Getting Started

The Quality Assurance Portal is a web-based application designed to manage Non-Conformance Product (NCP) reports throughout their lifecycle. This guide will help you understand how to use the system based on your role.

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Stable internet connection
- Valid user account

### Accessing the System
1. Open your web browser
2. Navigate to the Quality Assurance Portal URL provided by your administrator
3. Enter your username and password
4. Click "Login"

## Login and Authentication

### Login Process
1. Go to the login page
2. Enter your username
3. Enter your password
4. Click "Login" button

### Password Security
- Your password must be kept confidential
- Change your password regularly
- Use a strong password with letters, numbers, and special characters
- If you forget your password, contact your system administrator

### Session Management
- Your session will expire after a period of inactivity
- You will be automatically logged out for security
- Always click "Logout" when finished using the system

## Dashboard Overview

Upon login, you will be directed to your role-specific dashboard. The dashboard provides an overview of your activities and pending tasks.

### Common Dashboard Elements
- **User Information**: Your name and role are displayed in the top right corner
- **Navigation Menu**: Access different sections of the system
- **Notifications**: Alerts for important updates
- **Quick Actions**: Common tasks based on your role

### Dashboard by Role

#### QA User Dashboard
- Total NCP reports submitted
- Pending review status
- Recently submitted reports
- Rejected reports requiring attention

#### QA Leader Dashboard
- Reports pending your approval
- Reports you've approved
- Average approval time
- Pending approvals list

#### Team Leader Dashboard
- Reports assigned for RCA analysis
- Processed reports awaiting review
- Average processing time
- Assignment status

#### Process Lead Dashboard
- Reports pending your review
- Reports you've approved
- Average review time
- Pending reviews list

#### QA Manager Dashboard
- Reports pending final approval
- Reports you've approved this month
- Total approved reports
- Pending final approvals

#### Administrator Dashboard
- System-wide statistics
- User activity overview
- NCP report trends
- System health indicators

## NCP Report Workflow

The NCP Report Workflow is a structured process for managing quality issues from identification to resolution.

### Step 1: NCP Report Submission (QA User)
1. Click "Input NCP" in the navigation menu
2. Fill in the required information:
   - SKU Code: Select from available products
   - Machine Code: Select from available machines
   - Date and Time of Incident
   - Hold Quantity and Unit of Measure
   - Detailed Problem Description
   - Photo Attachment (optional but recommended)
   - QA Leader Assignment
3. Review all information for accuracy
4. Click "Submit Report"
5. You will receive a confirmation with the NCP ID

### Step 2: QA Leader Review
1. Navigate to "QA Approval" section
2. Review pending NCP reports assigned to you
3. Examine the problem description and photo
4. Determine disposition:
   - Sortir: Requires sorting/inspection
   - Release: Product can be released
   - Reject: Product must be rejected
5. Assign quantities for each disposition
6. Assign to a Team Leader for RCA analysis
7. Approve or reject the report:
   - If approved: Report moves to Team Leader
   - If rejected: Report returns to submitting user with reason

### Step 3: Team Leader RCA Analysis
1. Navigate to "TL Processing" section
2. Review assigned NCP reports
3. Conduct Root Cause Analysis:
   - Identify the underlying cause of the issue
   - Document findings in the "Root Cause Analysis" field
4. Develop Corrective Actions:
   - Immediate actions to address the issue
   - Document in "Corrective Action" field
5. Develop Preventive Actions:
   - Long-term measures to prevent recurrence
   - Document in "Preventive Action" field
6. Submit for Process Lead review

### Step 4: Process Lead Review
1. Navigate to "Process Lead Approval" section
2. Review processed NCP reports
3. Evaluate the RCA, corrective, and preventive actions
4. Approve or reject the report:
   - If approved: Report moves to QA Manager
   - If rejected: Report returns to Team Leader with specific rejection reason

### Step 5: QA Manager Final Approval
1. Navigate to "Manager Approval" section
2. Review NCP reports pending final approval
3. Evaluate the entire process and documentation
4. Provide final comments if needed
5. Approve or reject the report:
   - If approved: Report is archived and completed
   - If rejected: Report returns to Team Leader with specific rejection reason for revision

## Role-Specific Features

### QA User Features
- **Submit NCP Reports**: Create new non-conformance reports
- **View Own Reports**: Track status of submitted reports
- **Revise Rejected Reports**: Update and resubmit rejected reports
- **Report History**: View all submitted reports

### QA Leader Features
- **Approve NCP Reports**: Review and approve initial submissions
- **Assign Team Leaders**: Designate who will perform RCA
- **View Assigned Reports**: Track reports under your responsibility
- **Disposition Management**: Determine product disposition

### Team Leader Features
- **RCA Analysis**: Perform root cause analysis on assigned reports
- **Action Planning**: Develop corrective and preventive actions
- **Report Processing**: Submit completed analysis for review
- **Assignment Tracking**: Monitor assigned reports

### Process Lead Features
- **Review RCA**: Evaluate team leader's analysis and actions
- **Approve Processing**: Confirm quality of RCA work
- **Provide Feedback**: Return reports with improvement suggestions
- **Performance Monitoring**: Track team leader performance

### QA Manager Features
- **Final Approval**: Provide ultimate sign-off on NCP reports
- **Archive Management**: Oversee completed reports
- **Quality Assurance**: Ensure all steps were properly executed
- **Report Oversight**: Monitor overall NCP trends

### Administrator Features
- **User Management**: Create, modify, and delete user accounts
- **Role Assignment**: Assign roles and permissions
- **System Configuration**: Manage system settings
- **Report Access**: View all reports in the system
- **Audit Trail**: Monitor system activity

### Super Administrator Features
- **Full System Access**: Complete control over all system functions
- **Workflow Intervention**: Override normal workflow processes
- **Data Management**: Directly edit or delete any NCP report
- **System Settings**: Configure all system parameters
- **Monitoring**: View comprehensive system analytics
- **Security Management**: Manage API keys and system security

## System Administration

### User Management (Admin/Super Admin)
1. Navigate to "User Management" in the navigation menu
2. View the list of all system users
3. To add a new user:
   - Click "Add User" button
   - Enter username, full name, and password
   - Select appropriate role
   - Click "Create User"
4. To modify a user:
   - Click the edit icon next to the user
   - Change role, status, or reset password as needed
5. To delete a user:
   - Click the delete icon
   - Confirm deletion (irreversible action)

### System Settings (Admin/Super Admin)
1. Navigate to "System Settings" in the navigation menu
2. Manage SKU Codes:
   - Add new product codes and descriptions
   - Edit existing codes
   - Remove obsolete codes
3. Manage Machines:
   - Add new manufacturing machines
   - Update machine information
   - Remove decommissioned machines
4. Manage Units of Measure:
   - Add new UOM codes
   - Update UOM names
   - Remove unused UOMs
5. Configure NCP Numbering:
   - Set the format for auto-generated NCP IDs
   - Configure auto-reset options

### Audit and Monitoring (Admin/Super Admin)
1. **Audit Log**: Track all changes to NCP reports
   - View who made changes
   - See what fields were modified
   - Review change descriptions
2. **System Logs**: Monitor system events
   - View informational messages
   - Identify warnings and errors
   - Track system performance
3. **API Keys**: Manage external system access
   - Create new API keys
   - Assign permissions
   - Deactivate compromised keys

## Reporting and Analytics

### NCP Database
1. Navigate to "Database NCP" in the navigation menu
2. Use search and filter options to find specific reports:
   - Search by NCP ID, SKU, Machine, or Submitter
   - Filter by status
   - Sort by various criteria
3. View detailed report information:
   - Click "View" to see complete report details
   - Super Admins can edit or delete reports
   - Export data to Excel for further analysis

### Analytics Dashboard (Super Admin)
1. Navigate to "Analytics" in the navigation menu
2. View system-wide metrics:
   - Total NCP reports
   - Pending approvals
   - Completed reports
   - Rejected reports
3. Analyze trends:
   - Monthly report volume
   - Status distribution
   - Top submitters
4. Export reports for management review

### Custom Reports
1. Use the database view to create custom reports
2. Apply filters to narrow down data
3. Export to CSV/Excel for offline analysis
4. Create charts and graphs using external tools

## Troubleshooting

### Common Issues and Solutions

#### Login Problems
**Issue**: Cannot log in to the system
**Solutions**:
- Verify username and password are correct
- Check that Caps Lock is off
- Clear browser cache and cookies
- Contact administrator if account may be locked

#### Report Submission Errors
**Issue**: Error when submitting NCP report
**Solutions**:
- Check all required fields are filled
- Ensure photo file size is within limits
- Verify internet connection is stable
- Try submitting again after a few minutes

#### Slow Performance
**Issue**: System is responding slowly
**Solutions**:
- Close other browser tabs
- Refresh the page
- Try during off-peak hours
- Contact administrator if problem persists

#### Missing Menu Items
**Issue**: Cannot see expected menu options
**Solutions**:
- Verify your user role with administrator
- Refresh the page
- Clear browser cache
- Log out and log back in

#### Report Not Updating
**Issue**: Changes to report are not saving
**Solutions**:
- Check internet connection
- Ensure all required fields are completed
- Try saving again
- Contact administrator for Super Admin intervention

### Browser Compatibility
The system is optimized for:
- Google Chrome (latest version)
- Mozilla Firefox (latest version)
- Microsoft Edge (latest version)
- Safari (latest version)

### Mobile Access
While the system can be accessed on mobile devices, it is optimized for desktop use. For the best experience, use a desktop or laptop computer.

### Data Privacy and Security
- All data is encrypted during transmission
- Passwords are securely hashed
- Access is restricted by role-based permissions
- Regular security audits are performed
- Report any suspicious activity to your administrator

## Support and Contact

For technical support:
- Contact your system administrator
- Email: [support email]
- Phone: [support phone number]

For training and user questions:
- Contact your QA department manager
- Email: [training email]
- Refer to this user guide for detailed instructions

## Feedback and Improvement

We welcome your feedback to improve the Quality Assurance Portal:
- Report bugs or issues
- Suggest new features
- Provide usability feedback
- Share workflow improvement ideas

Contact your administrator to submit feedback or request new features.

---

This user guide provides comprehensive instructions for using the Quality Assurance Portal. For the most current information, always refer to the latest version of this guide. Regular training sessions are recommended to stay updated on new features and best practices.