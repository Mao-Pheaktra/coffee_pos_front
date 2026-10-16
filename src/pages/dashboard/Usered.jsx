import React, { useEffect, useMemo, useState } from 'react'

import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
  UserCheck,
  User,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'

import {
  getUserSummary,
  getAdminUsers,
  deleteAdminUser,
  createAdminUser,
} from '../../services/adminService'

export default function Usered() {

  // ==========================================
  // FILTERS
  // ==========================================

  const [selectedRole, setSelectedRole] = useState('All Roles')
  const [searchQuery, setSearchQuery] = useState('')

  // ==========================================
  // USERS
  // ==========================================

  const [users, setUsers] = useState([])

  const [summary, setSummary] = useState({
    total_users: 0,
    total_admins: 0,
    total_cashiers: 0,
    total_customers: 0,
  })

  // ==========================================
  // LOADING / ERROR
  // ==========================================

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  // ==========================================
  // ADD USER
  // ==========================================

  const [showAddModal, setShowAddModal] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
    status: 'active',
    profileImage: null,
  })

  const [formError, setFormError] = useState('')

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 5

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const [summaryResponse, usersResponse] =
        await Promise.all([
          getUserSummary(),
          getAdminUsers(),
        ])

      console.log('User summary:', summaryResponse)
      console.log('Admin users:', usersResponse)

      // ----------------------------------------
      // SUMMARY
      // ----------------------------------------

      const summaryData =
        summaryResponse?.data || {}

      setSummary({
        total_users: Number(
          summaryData.total_users ?? 0
        ),

        total_admins: Number(
          summaryData.total_admins ?? 0
        ),

        total_cashiers: Number(
          summaryData.total_cashiers ?? 0
        ),

        total_customers: Number(
          summaryData.total_customers ?? 0
        ),
      })

      // ----------------------------------------
      // USERS
      // ----------------------------------------

      const usersData =
        usersResponse?.data

      if (Array.isArray(usersData)) {

        setUsers(usersData)

      } else if (
        Array.isArray(usersData?.data)
      ) {

        setUsers(usersData.data)

      } else {

        setUsers([])

      }

    } catch (err) {

      console.error(
        'Failed to fetch users:',
        err
      )

      setError(
        err.response?.data?.message ||
        'Failed to load users.'
      )

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // ==========================================
  // NORMALIZE USERS
  // ==========================================

  const normalizedUsers = useMemo(() => {

    return users.map((user) => {

      const role =
        String(user.role || '').toLowerCase()

      let formattedRole = 'Customer'

      if (role === 'admin') {
        formattedRole = 'Admin'
      } else if (role === 'cashier') {
        formattedRole = 'Cashier'
      }

      // ----------------------------------------
      // STATUS
      // ----------------------------------------

      let status = 'Active'

      if (
        user.status !== undefined &&
        user.status !== null
      ) {

        const rawStatus =
          String(user.status).toLowerCase()

        status =
          rawStatus === 'active'
            ? 'Active'
            : 'Inactive'
      }

      // ----------------------------------------
      // PROFILE IMAGE
      // ----------------------------------------

      const avatar =
        user.profileImage ||
        user.avatar ||
        user.image ||
        null

      // ----------------------------------------
      // INITIALS
      // ----------------------------------------

      const initials =
        user.name
          ?.split(' ')
          .map((word) => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'U'

      return {
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email || '-',
        role: formattedRole,
        status,
        avatar,
        initials,
        original: user,
      }
    })

  }, [users])

  // ==========================================
  // SEARCH + ROLE FILTER
  // ==========================================

  const filteredUsers = useMemo(() => {

    return normalizedUsers.filter((user) => {

      let matchesRole = true

      if (
        selectedRole !== 'All Roles'
      ) {
        matchesRole =
          user.role === selectedRole
      }

      let matchesSearch = true

      if (searchQuery.trim()) {

        const query =
          searchQuery
            .toLowerCase()
            .trim()

        matchesSearch =
          user.name
            .toLowerCase()
            .includes(query) ||

          user.email
            .toLowerCase()
            .includes(query) ||

          user.role
            .toLowerCase()
            .includes(query)
      }

      return (
        matchesRole &&
        matchesSearch
      )
    })

  }, [
    normalizedUsers,
    selectedRole,
    searchQuery,
  ])

  // ==========================================
  // RESET PAGE
  // ==========================================

  useEffect(() => {
    setCurrentPage(1)
  }, [
    selectedRole,
    searchQuery,
  ])

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(
    filteredUsers.length /
    itemsPerPage
  )

  const paginatedUsers =
    useMemo(() => {

      const startIndex =
        (currentPage - 1) *
        itemsPerPage

      return filteredUsers.slice(
        startIndex,
        startIndex + itemsPerPage
      )

    }, [
      filteredUsers,
      currentPage,
    ])

  // ==========================================
  // ADD USER FORM CHANGE
  // ==========================================

  const handleFormChange = (e) => {

    const {
      name,
      value,
      files,
    } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'profileImage'
          ? files?.[0] || null
          : value,
    }))
  }

  // ==========================================
  // OPEN ADD USER
  // ==========================================

  const handleOpenAddUser = () => {

    setFormError('')

    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'client',
      status: 'active',
      profileImage: null,
    })

    setShowAddModal(true)
  }

  // ==========================================
  // CREATE USER
  // ==========================================

  const handleCreateUser = async (e) => {

    e.preventDefault()

    try {

      setCreatingUser(true)
      setFormError('')

      if (!formData.name.trim()) {
        setFormError(
          'Name is required.'
        )
        return
      }

      if (!formData.email.trim()) {
        setFormError(
          'Email is required.'
        )
        return
      }

      if (!formData.password) {
        setFormError(
          'Password is required.'
        )
        return
      }

      if (formData.password.length < 6) {
        setFormError(
          'Password must be at least 6 characters.'
        )
        return
      }

      // ----------------------------------------
      // CREATE FORMDATA
      // ----------------------------------------

      const data = new FormData()

      data.append(
        'name',
        formData.name
      )

      data.append(
        'email',
        formData.email
      )

      data.append(
        'password',
        formData.password
      )

      if (formData.phone) {
        data.append(
          'phone',
          formData.phone
        )
      }

      data.append(
        'role',
        formData.role
      )

      data.append(
        'status',
        formData.status
      )

      if (formData.profileImage) {
        data.append(
          'profileImage',
          formData.profileImage
        )
      }

      console.log(
        'Creating user...'
      )

      const response =
        await createAdminUser(data)

      console.log(
        'User created:',
        response
      )

      // ----------------------------------------
      // CLOSE MODAL
      // ----------------------------------------

      setShowAddModal(false)

      // ----------------------------------------
      // REFRESH DATA
      // ----------------------------------------

      await fetchUsers()

    } catch (err) {

      console.error(
        'Create user error:',
        err
      )

      const errors =
        err.response?.data?.errors

      if (errors) {

        const firstError =
          Object.values(errors)
            .flat()[0]

        setFormError(
          firstError ||
          'Failed to create user.'
        )

      } else {

        setFormError(
          err.response?.data?.message ||
          'Failed to create user.'
        )
      }

    } finally {

      setCreatingUser(false)

    }
  }

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (user) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${user.name}?`
      )

    if (!confirmed) return

    try {

      setDeletingId(user.id)
      setError('')

      await deleteAdminUser(user.id)

      // Remove from UI
      setUsers((prevUsers) =>
        prevUsers.filter(
          (item) =>
            item.id !== user.id
        )
      )

      // Update summary
      setSummary((prev) => ({

        ...prev,

        total_users:
          Math.max(
            prev.total_users - 1,
            0
          ),

        total_admins:
          user.role === 'Admin'
            ? Math.max(
                prev.total_admins - 1,
                0
              )
            : prev.total_admins,

        total_cashiers:
          user.role === 'Cashier'
            ? Math.max(
                prev.total_cashiers - 1,
                0
              )
            : prev.total_cashiers,

        total_customers:
          user.role === 'Customer'
            ? Math.max(
                prev.total_customers - 1,
                0
              )
            : prev.total_customers,

      }))

    } catch (err) {

      console.error(
        'Delete user error:',
        err
      )

      setError(
        err.response?.data?.message ||
        'Failed to delete user.'
      )

    } finally {

      setDeletingId(null)

    }
  }

  // ==========================================
  // ROLE FILTERS
  // ==========================================

  const roleFilters = [
    'All Roles',
    'Admin',
    'Cashier',
    'Customer',
  ]

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <main className="flex-1 min-h-screen flex items-center justify-center bg-neutral-50">

        <div className="flex items-center gap-2 text-sm text-neutral-600">

          <Loader2
            size={18}
            className="animate-spin"
          />

          Loading users...

        </div>

      </main>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && users.length === 0) {

    return (
      <main className="flex-1 min-h-screen flex items-center justify-center bg-neutral-50">

        <div className="text-center">

          <AlertCircle
            size={32}
            className="mx-auto mb-3 text-red-500"
          />

          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

        </div>

      </main>
    )
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <>
      <main className="flex-1 p-8 space-y-6 overflow-y-auto text-neutral-900">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold tracking-tight">
              User Management
            </h2>

            <p className="text-xs text-neutral-500 font-medium">
              Manage team access and system roles.
            </p>

          </div>

          <button
            type="button"
            onClick={handleOpenAddUser}
            className="px-5 py-2.5 bg-[#1f1611] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
          >

            <Plus size={16} />

            Add New User

          </button>

        </div>

        {/* ===================================== */}
        {/* ERROR */}
        {/* ===================================== */}

        {error && users.length > 0 && (

          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">

            <AlertCircle size={16} />

            {error}

          </div>

        )}

        {/* ===================================== */}
        {/* METRICS */}
        {/* ===================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">

          <MetricCard
            title="Total Users"
            value={summary.total_users}
            icon={<Users size={16} />}
            description="Across all active roles"
          />

          <MetricCard
            title="Total Admins"
            value={summary.total_admins}
            icon={<ShieldCheck size={16} />}
            description="Full system permissions"
          />

          <MetricCard
            title="Total Clients"
            value={summary.total_customers}
            icon={<User size={16} />}
            description="Customer accounts"
          />

          <MetricCard
            title="Total Cashiers"
            value={summary.total_cashiers}
            icon={<UserCheck size={16} />}
            description="POS staff members"
          />

        </div>

        {/* ===================================== */}
        {/* TABLE */}
        {/* ===================================== */}

        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-[24px] p-6 space-y-6 shadow-2xs">

          {/* SEARCH */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="relative w-full md:w-80">

              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                <Search size={15} />
              </span>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-full text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-400"
              />

            </div>

            <div className="flex items-center gap-2 flex-wrap">

              {roleFilters.map(
                (role) => (

                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      setSelectedRole(
                        role
                      )
                    }
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                      selectedRole === role
                        ? 'bg-rose-100/60 text-rose-900 border-rose-200'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >

                    {role.toUpperCase()}

                  </button>

                )
              )}

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead>

                <tr className="border-b border-neutral-200 text-neutral-400">

                  <th className="pb-3 text-[10px] uppercase">
                    Name
                  </th>

                  <th className="pb-3 text-[10px] uppercase">
                    Email
                  </th>

                  <th className="pb-3 text-[10px] uppercase">
                    Role
                  </th>

                  <th className="pb-3 text-[10px] uppercase">
                    Status
                  </th>

                  <th className="pb-3 text-[10px] uppercase text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-neutral-200">

                {paginatedUsers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="py-12 text-center text-neutral-500"
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  paginatedUsers.map(
                    (user) => {

                      const isActive =
                        user.status ===
                        'Active'

                      return (

                        <tr
                          key={user.id}
                          className="hover:bg-neutral-50"
                        >

                          {/* NAME */}

                          <td className="py-3.5">

                            <div className="flex items-center gap-3">

                              {user.avatar ? (

                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                                />

                              ) : (

                                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 font-bold text-[11px] flex items-center justify-center">
                                  {user.initials}
                                </div>

                              )}

                              <span className="font-bold">
                                {user.name}
                              </span>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td className="py-3.5 text-neutral-500">
                            {user.email}
                          </td>

                          {/* ROLE */}

                          <td className="py-3.5">

                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                user.role === 'Admin'
                                  ? 'bg-neutral-900 text-white border-neutral-900'
                                  : user.role === 'Cashier'
                                  ? 'bg-neutral-100 text-neutral-700 border-neutral-300'
                                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                              }`}
                            >
                              {user.role.toUpperCase()}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="py-3.5">

                            <span
                              className={`inline-flex items-center gap-1.5 font-medium ${
                                isActive
                                  ? 'text-emerald-600'
                                  : 'text-neutral-400'
                              }`}
                            >

                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-500'
                                    : 'bg-neutral-400'
                                }`}
                              />

                              {user.status}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="py-3.5 text-left">

                            <div className="inline-flex items-center gap-1.5">

                              <button
                                type="button"
                                className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 text-neutral-600"
                                title="View"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                type="button"
                                className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 text-neutral-600"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteUser(
                                    user
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  user.id
                                }
                                className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                              >

                                {deletingId ===
                                user.id ? (

                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />

                                ) : (

                                  <Trash2
                                    size={14}
                                  />

                                )}

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          {filteredUsers.length > 0 && (

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">

              <div>

                Showing{' '}

                <span className="font-semibold text-neutral-900">
                  {(currentPage - 1) *
                    itemsPerPage +
                    1}
                </span>

                {' '}to{' '}

                <span className="font-semibold text-neutral-900">
                  {Math.min(
                    currentPage *
                      itemsPerPage,
                    filteredUsers.length
                  )}
                </span>

                {' '}of{' '}

                <span className="font-semibold text-neutral-900">
                  {filteredUsers.length}
                </span>

              </div>

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.max(
                          prev - 1,
                          1
                        )
                    )
                  }
                  className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronLeft
                    size={14}
                  />
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                      currentPage === page
                        ? 'bg-neutral-900 text-white'
                        : 'border border-neutral-200'
                    }`}
                  >
                    {page}
                  </button>

                ))}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                      totalPages ||
                    totalPages === 0
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.min(
                          prev + 1,
                          totalPages
                        )
                    )
                  }
                  className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>

            </div>

          )}

        </div>

      </main>

      {/* ===================================== */}
      {/* ADD USER MODAL */}
      {/* ===================================== */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-neutral-200">

              <div>

                <h3 className="text-lg font-bold text-neutral-900">
                  Add New User
                </h3>

                <p className="text-xs text-neutral-500 mt-1">
                  Create a new system account.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="p-2 rounded-lg hover:bg-neutral-100"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateUser}
              className="p-6 space-y-4"
            >

              {formError && (

                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">

                  <AlertCircle
                    size={15}
                  />

                  {formError}

                </div>

              )}

              {/* NAME */}

              <div>

                <label className="block text-xs font-semibold mb-1.5">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-400"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-xs font-semibold mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter email"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-400"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="block text-xs font-semibold mb-1.5">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-400"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-xs font-semibold mb-1.5">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-400"
                />

              </div>

              {/* ROLE + STATUS */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-semibold mb-1.5">
                    Role
                  </label>

                  <select
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleFormChange
                    }
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none"
                  >

                    <option value="client">
                      Customer
                    </option>

                    <option value="cashier">
                      Cashier
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-xs font-semibold mb-1.5">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleFormChange
                    }
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none"
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="inActive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              {/* PROFILE IMAGE */}

              <div>

                <label className="block text-xs font-semibold mb-1.5">
                  Profile Image
                </label>

                <input
                  type="file"
                  name="profileImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleFormChange
                  }
                  className="w-full text-xs"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2.5 rounded-xl bg-[#1f1611] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >

                  {creatingUser && (

                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                  )}

                  {creatingUser
                    ? 'Creating...'
                    : 'Create User'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  )
}


// ==========================================
// METRIC CARD
// ==========================================

function MetricCard({
  title,
  value,
  icon,
  description,
}) {

  return (

    <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-[20px] p-5 space-y-3 shadow-2xs">

      <div className="flex justify-between items-center text-neutral-500 text-xs font-medium">

        <span>
          {title}
        </span>

        <span className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-lg">
          {icon}
        </span>

      </div>

      <div className="font-extrabold text-xl text-neutral-900">
        {value}
      </div>

      <div className="text-[11px] font-medium text-neutral-500">
        {description}
      </div>

    </div>
  )
}