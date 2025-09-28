// lib/supabaseDatabase.ts
import { supabase } from './supabaseClient'
import { compare, hashSync } from 'bcryptjs'
import crypto from 'crypto'

// User authentication functions
export async function authenticateUser(username: string, password: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, full_name, password')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const isValid = await compare(password, data.password)
  if (!isValid) return null

  return {
    id: data.id,
    username: data.username,
    role: data.role,
    fullName: data.full_name,
  }
}

// Get user by username
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, full_name, is_active')
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, full_name, is_active, created_at')

  if (error) throw new Error(error.message)
  return data
}

export async function getUsersByRole(role: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name')
    .eq('role', role)
    .eq('is_active', true)

  if (error) throw new Error(error.message)
  return data
}

export async function updateUserRole(userId: number, newRole: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function createUser(username: string, password: string, role: string, fullName: string) {
  try {
    const hashedPassword = hashSync(password, 10)
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password: hashedPassword,
          role,
          full_name: fullName || null,
          is_active: true,
        },
      ])
      .select()

    if (error) throw new Error(error.message)
    return data[0]
  } catch (error) {
    console.error('Error in createUser function:', error)
    throw error
  }
}

export async function deleteUser(userId: number) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) throw new Error(error.message)
  return data
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const hashedPassword = hashSync(newPassword, 10)
  const { data, error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id', userId)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function updateUserUsername(userId: number, newUsername: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ username: newUsername })
    .eq('id', userId)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function updateUserStatus(userId: number, isActive: boolean) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// NCP Reports functions
export async function generateNCPNumber(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  // Get the latest serial number for current year
  const { data, error } = await supabase
    .from('ncp_reports')
    .select('ncp_id')
    .like('ncp_id', `${year}${month}-%`)
    .order('ncp_id', { ascending: false })
    .limit(1)
    .single()

  let serialNumber = 1

  if (data && !error) {
    const existingSerial = data.ncp_id.split('-')[1]
    serialNumber = parseInt(existingSerial) + 1
  }

  const formattedSerial = serialNumber.toString().padStart(4, '0')
  return `${year}${month}-${formattedSerial}`
}

export async function createNCPReport(data: any, submittedBy: string) {
  const ncpId = await generateNCPNumber()

  const { data: result, error } = await supabase
    .from('ncp_reports')
    .insert([
      {
        ncp_id: ncpId,
        sku_code: data.skuCode,
        machine_code: data.machineCode,
        date: data.date,
        time_incident: data.timeIncident,
        hold_quantity: data.holdQuantity,
        hold_quantity_uom: data.holdQuantityUOM,
        problem_description: data.problemDescription,
        photo_attachment: data.photoAttachment || null,
        qa_leader: data.qaLeader,
        submitted_by: submittedBy,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Create notification for the selected QA Leader
  const { data: qaLeaderUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', data.qaLeader)
    .single()

  if (qaLeaderUser) {
    await createNotification(
      qaLeaderUser.id,
      ncpId,
      'New NCP Submitted',
      `NCP ${ncpId} requires your approval`
    )
  }

  return { id: result.id, ncpId }
}

export async function getAllNCPReports() {
  const { data, error } = await supabase
    .from('ncp_reports')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getNCPReportsForUser(userId: number, userRole: string, username: string) {
  let query = supabase.from('ncp_reports').select('*')

  switch (userRole) {
    case 'user':
      query = query.eq('submitted_by', username)
      break
    case 'qa_leader':
      // No additional filter needed
      break
    case 'team_leader':
      query = query.eq('assigned_team_leader', username)
      break
    case 'process_lead':
      query = query.in('status', ['tl_processed', 'process_approved', 'process_rejected'])
      break
    case 'qa_manager':
    case 'admin':
      // No additional filter needed
      break
    default:
      query = query.eq('submitted_by', username)
  }

  query = query.order('submitted_at', { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getPendingNCPsForRole(userRole: string, username: string) {
  let query = supabase.from('ncp_reports').select('*')

  switch (userRole) {
    case 'qa_leader':
      query = query.eq('status', 'pending').eq('qa_leader', username)
      break
    case 'team_leader':
      query = query
        .eq('assigned_team_leader', username)
        .in('status', ['qa_approved', 'tl_processed'])
      break
    case 'process_lead':
      query = query.eq('status', 'tl_processed')
      break
    case 'qa_manager':
      query = query.eq('status', 'process_approved')
      break
    default:
      return []
  }

  query = query.order(
    userRole === 'qa_leader' || userRole === 'team_leader' ? 'qa_approved_at' : 'tl_processed_at',
    { ascending: true }
  )

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getNCPById(id: number) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// QA Leader approval functions
export async function approveNCPByQALeader(
  id: number,
  approvalData: any,
  qaLeaderUsername: string
) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .update({
      status: 'qa_approved',
      qa_approved_by: qaLeaderUsername,
      qa_approved_at: new Date().toISOString(),
      disposisi: approvalData.disposisi,
      jumlah_sortir: approvalData.jumlahSortir || '0',
      jumlah_release: approvalData.jumlahRelease || '0',
      jumlah_reject: approvalData.jumlahReject || '0',
      assigned_team_leader: approvalData.assignedTeamLeader,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (data) {
    // Create notification for assigned team leader
    const { data: teamLeaderUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', approvalData.assignedTeamLeader)
      .single()

    if (teamLeaderUser) {
      await createNotification(
        teamLeaderUser.id,
        data.ncp_id,
        'NCP Assigned to You',
        `NCP ${data.ncp_id} has been approved by QA Leader and assigned to you for RCA analysis`
      )
    }
  }

  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0  // For update operations, return number of affected rows
  }
}

export async function rejectNCPByQALeader(
  id: number,
  rejectionReason: string,
  qaLeaderUsername: string
) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .update({
      status: 'qa_rejected',
      qa_approved_by: qaLeaderUsername,
      qa_approved_at: new Date().toISOString(),
      qa_rejection_reason: rejectionReason,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0  // For update operations, return number of affected rows
  }
}

// Team Leader processing functions
export async function processNCPByTeamLeader(
  id: number,
  processData: any,
  teamLeaderUsername: string
) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .update({
      status: 'tl_processed',
      tl_processed_by: teamLeaderUsername,
      tl_processed_at: new Date().toISOString(),
      root_cause_analysis: processData.rootCauseAnalysis,
      corrective_action: processData.correctiveAction,
      preventive_action: processData.preventiveAction,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (data) {
    // Create notification for process leads
    await createNotificationForRole(
      'process_lead',
      data.ncp_id,
      'NCP Ready for Process Review',
      `NCP ${data.ncp_id} has been processed by Team Leader and requires process review`
    )
  }

  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0  // For update operations, return number of affected rows
  }
}

// Process Lead functions
export async function approveNCPByProcessLead(
  id: number,
  comment: string,
  processLeadUsername: string
) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .update({
      status: 'process_approved',
      process_approved_by: processLeadUsername,
      process_approved_at: new Date().toISOString(),
      process_comment: comment,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (data) {
    // Create notification for QA Managers
    await createNotificationForRole(
      'qa_manager',
      data.ncp_id,
      'NCP Ready for Final Approval',
      `NCP ${data.ncp_id} has been approved by Process Lead and requires final QA Manager approval`
    )
  }

  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0  // For update operations, return number of affected rows
  }
}
export async function rejectNCPByProcessLead(
  id: number,
  rejectionReason: string,
  processLeadUsername: string

) {

  const { data, error } = await supabase
    .from('ncp_reports')
    .update({
      status: 'qa_approved',
      process_approved_by: null,
      process_approved_at: null,
      process_rejection_reason: rejectionReason,
      process_comment: null,
    })
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)

  if (data && data.length > 0) {
    // Get NCP details for notification
    const ncp = data[0]

    // Create notification for assigned team leader
    const { data: teamLeaderUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', ncp.assigned_team_leader)
      .single()

    if (teamLeaderUser) {
      await createNotification(
        teamLeaderUser.id,
        ncp.ncp_id,
        'NCP Rejected by Process Lead',
        `NCP ${ncp.ncp_id} has been rejected by Process Lead and returned for reprocessing. Reason: ${rejectionReason}`
      )
    }
  }

  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function rejectNCPByQAManager(
  id: number,
  rejectionReason: string,
  qaManagerUsername: string
) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .update({
      status: 'qa_approved',
      manager_approved_by: null,
      manager_approved_at: null,
      manager_rejection_reason: rejectionReason,
      manager_comment: null,
    })
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)

  if (data && data.length > 0) {
    const ncp = data[0]

    // Create notification for assigned team leader
    const { data: teamLeaderUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', ncp.assigned_team_leader)
      .single()

    if (teamLeaderUser) {
      await createNotification(
        teamLeaderUser.id,
        ncp.ncp_id,
        'NCP Rejected by QA Manager',
        `NCP ${ncp.ncp_id} has been rejected by QA Manager and returned for reprocessing. Reason: ${rejectionReason}`
      )
    }
  }

  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// Notification functions
export async function createNotification(
  userId: number,
  ncpId: string,
  title: string,
  message: string,
  type = 'info'
) {
  try {
    const { data, error } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        ncp_id: ncpId,
        title: title,
        message: message,
        type: type,
      },
    ]);

    if (error) {
      // Handle RLS errors gracefully - just log and continue
      console.warn('Warning: Could not create notification due to RLS policy:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    // Handle RLS errors gracefully - just log and continue
    console.warn('Warning: Could not create notification due to RLS policy:', error.message);
    return null;
  }
}export async function createNotificationForRole(
  role: string,
  ncpId: string,
  title: string,
  message: string,
  type = 'info'
) {
  const { data: users } = await supabase.from('users').select('id').eq('role', role)

  if (users) {
    for (const user of users) {
      await createNotification(user.id, ncpId, title, message, type)
    }
  }
}

export async function getNotificationsForUser(userId: number, limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

export async function getUnreadNotificationCount(userId: number) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw new Error(error.message)
  return count || 0
}

export async function markNotificationAsRead(notificationId: number) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw new Error(error.message)
  return data
}

export async function markAllNotificationsAsRead(userId: number) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

// Statistics functions
export async function getNCPStatistics() {
  const [
    { count: total },
    { count: pending },
    { count: qaApproved },
    { count: tlProcessed },
    { count: rejected },
  ] = await Promise.all([
    supabase.from('ncp_reports').select('*', { count: 'exact' }).range(0, 0),
    supabase
      .from('ncp_reports')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .range(0, 0),
    supabase
      .from('ncp_reports')
      .select('*', { count: 'exact' })
      .eq('status', 'qa_approved')
      .range(0, 0),
    supabase
      .from('ncp_reports')
      .select('*', { count: 'exact' })
      .eq('status', 'tl_processed')
      .range(0, 0),
    supabase
      .from('ncp_reports')
      .select('*', { count: 'exact' })
      .like('status', '%rejected')
      .range(0, 0),
  ])

  return {
    total: total || 0,
    pending: pending || 0,
    qaApproved: qaApproved || 0,
    tlProcessed: tlProcessed || 0,
    rejected: rejected || 0,
  }
}

export async function getNCPStatisticsForRole(userRole: string, username: string) {
  let baseQuery = supabase.from('ncp_reports').select('*', { count: 'exact' })

  switch (userRole) {
    case 'user':
      baseQuery = baseQuery.eq('submitted_by', username)
      break
    case 'qa_leader':
      // No additional filter needed
      break
    case 'team_leader':
      baseQuery = baseQuery.eq('assigned_team_leader', username)
      break
    default:
      // No additional filter needed
      break
  }

  // Execute all queries in parallel
  const [
    { count: total },
    { count: pending },
    { count: approved },
    { count: processed },
  ] = await Promise.all([
    baseQuery.range(0, 0),
    baseQuery.clone().eq('status', 'pending').range(0, 0),
    baseQuery.clone().like('status', '%approved').range(0, 0),
    baseQuery.clone().like('status', '%processed').range(0, 0),
  ])

  return {
    total: total || 0,
    pending: pending || 0,
    approved: approved || 0,
    processed: processed || 0,
  }
}

// System Settings Functions
export async function getSystemSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .single()

  if (error) return null
  return data?.setting_value || null
}

export async function setSystemSetting(key: string, value: string, description: string = '') {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert(
      {
        setting_key: key,
        setting_value: value,
        description: description,
      },
      { onConflict: 'setting_key' }
    )
    .select()

  if (error) throw new Error(error.message)
  return data
}

// SKU Codes Functions
export async function getAllSKUCodes() {
  const { data, error } = await supabase
    .from('sku_codes')
    .select('*')
    .order('code', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createSKUCode(code: string, description: string) {
  const { data, error } = await supabase
    .from('sku_codes')
    .insert([{ code, description }])
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function updateSKUCode(id: number, code: string, description: string) {
  const { data, error } = await supabase
    .from('sku_codes')
    .update({ code, description })
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function deleteSKUCode(id: number) {
  const { data, error } = await supabase.from('sku_codes').delete().eq('id', id)

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// Machines Functions
export async function getAllMachines() {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('code', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createMachine(code: string, name: string) {
  const { data, error } = await supabase
    .from('machines')
    .insert([{ code, name }])
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function updateMachine(id: number, code: string, name: string) {
  const { data, error } = await supabase
    .from('machines')
    .update({ code, name })
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function deleteMachine(id: number) {
  const { data, error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// UOMs Functions
export async function getAllUOMs() {
  const { data, error } = await supabase
    .from('uoms')
    .select('*')
    .order('code', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createUOM(code: string, name: string) {
  const { data, error } = await supabase
    .from('uoms')
    .insert([{ code, name }])
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function updateUOM(id: number, code: string, name: string) {
  const { data, error } = await supabase
    .from('uoms')
    .update({ code, name })
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function deleteUOM(id: number) {
  const { data, error } = await supabase
    .from('uoms')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// Audit Log Functions
export async function logNCPChange(
  ncpId: string,
  changedBy: string,
  fieldChanged: string,
  oldValue: any,
  newValue: any,
  description: string
) {
  const { data, error } = await supabase.from('ncp_audit_log').insert([
    {
      ncp_id: ncpId,
      changed_by: changedBy,
      field_changed: fieldChanged,
      old_value: String(oldValue),
      new_value: String(newValue),
      description: description,
    },
  ])

  if (error) throw new Error(error.message)
  return data
}

export async function getAuditLog() {
  const { data, error } = await supabase
    .from('ncp_audit_log')
    .select('*')
    .order('changed_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// System Log Functions
export async function logSystemEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  details: any
) {
  try {
    const { data, error } = await supabase.from('system_logs').insert([
      {
        level: level,
        message: message,
        details: JSON.stringify(details),
      },
    ]);

    if (error) {
      // Handle RLS errors gracefully - just log and continue
      console.warn('Warning: Could not log system event due to RLS policy:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    // Handle RLS errors gracefully - just log and continue
    console.warn('Warning: Could not log system event due to RLS policy:', error.message);
    return null;
  }
}export async function getSystemLogs() {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// API Key Functions
export async function getApiKeys() {
  const { data, error } = await supabase.from('api_keys').select('*')

  if (error) throw new Error(error.message)
  return data
}

export async function createApiKey(serviceName: string, permissions: string[]) {
  const key = `sk_${crypto.randomBytes(24).toString('hex')}`
  const { data, error } = await supabase.from('api_keys').insert([
    {
      key: key,
      service_name: serviceName,
      permissions: JSON.stringify(permissions),
    },
  ])

  if (error) throw new Error(error.message)

  return { key }
}

export async function deleteApiKey(id: number) {
  const { data, error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// Super Admin Functions
export async function superEditNCP(ncpId: number, data: any, changedBy: string) {
  const ncp = await getNCPById(ncpId)
  if (!ncp) {
    return { data: null, changes: 0 }
  }

  const fields = Object.keys(data)
  const values = Object.values(data)

  if (fields.length === 0) {
    return { data: null, changes: 0 }
  }

  for (const field of fields) {
    if ((ncp as any)[field] !== (data as any)[field]) {
      await logNCPChange(
        (ncp as any).ncp_id,
        changedBy,
        field,
        (ncp as any)[field],
        (data as any)[field],
        `Field ${field} updated by super_admin`
      )
    }
  }

  const { data: result, error } = await supabase
    .from('ncp_reports')
    .update(data)
    .eq('id', ncpId)

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data: result,
    changes: result ? result.length : 0
  }
}

export async function revertNCPStatus(ncpId: number, newStatus: string, changedBy: string) {
  const ncp: any = await getNCPById(ncpId)
  if (ncp) {
    await logNCPChange(
      ncp.ncp_id,
      changedBy,
      'status',
      ncp.status,
      newStatus,
      `Status reverted to ${newStatus} by super_admin`
    )
  }

  const { data, error } = await supabase
    .from('ncp_reports')
    .update({ status: newStatus })
    .eq('id', ncpId)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function reassignNCP(
  ncpId: number,
  newAssignee: string,
  role: 'qa_leader' | 'team_leader',
  changedBy: string
) {
  const ncp: any = await getNCPById(ncpId)
  if (!ncp) return { data: null, changes: 0 }

  let columnToUpdate = ''
  let oldAssignee = ''
  if (role === 'qa_leader') {
    columnToUpdate = 'qa_leader'
    oldAssignee = ncp.qa_leader
  } else if (role === 'team_leader') {
    columnToUpdate = 'assigned_team_leader'
    oldAssignee = ncp.assigned_team_leader
  } else {
    return { data: null, changes: 0 }
  }

  await logNCPChange(
    ncp.ncp_id,
    changedBy,
    columnToUpdate,
    oldAssignee,
    newAssignee,
    `Reassigned to ${newAssignee} by super_admin`
  )

  const updateData: any = {}
  updateData[columnToUpdate] = newAssignee

  const { data, error } = await supabase
    .from('ncp_reports')
    .update(updateData)
    .eq('id', ncpId)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

export async function deleteNCPReport(id: number) {
  const { data, error } = await supabase
    .from('ncp_reports')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  
  // Return an object with changes property to match expected API response
  return {
    data,
    changes: data ? data.length : 0
  }
}

// Analytics Functions
export async function getNCPsByMonth() {
  // Note: Supabase doesn't have direct date_trunc equivalent, so we'll handle this differently
  const { data, error } = await supabase.rpc('get_ncps_by_month')

  if (error) throw new Error(error.message)
  return data
}

export async function getAverageApprovalTime() {
  // This would require a custom Postgres function in Supabase
  const { data, error } = await supabase.rpc('get_average_approval_time')

  if (error) throw new Error(error.message)
  return data || 0
}

export async function getNCPStatusDistribution() {
  const { data, error } = await supabase.rpc('get_ncp_status_distribution')

  if (error) throw new Error(error.message)
  return data
}

export async function getNCPsByTopSubmitters(limit = 5) {
  const { data, error } = await supabase.rpc('get_ncps_by_top_submitters', { limit_count: limit })

  if (error) throw new Error(error.message)
  return data
}
