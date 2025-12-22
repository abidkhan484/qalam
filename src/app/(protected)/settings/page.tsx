'use client'

import { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui'

export default function SettingsPage() {
  // Profile form state
  const [name, setName] = useState('User Name')
  const [email, setEmail] = useState('user@example.com')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileSuccess(false)

    try {
      // TODO: Call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProfileSuccess(true)
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordSaving(true)

    try {
      // TODO: Call API to update password
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="container-narrow py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profileSuccess && (
              <Alert variant="success" className="mb-6" onDismiss={() => setProfileSuccess(false)}>
                Profile updated successfully!
              </Alert>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <Button type="submit" isLoading={profileSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="error" className="mb-6" onDismiss={() => setPasswordError('')}>
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert variant="success" className="mb-6" onDismiss={() => setPasswordSuccess(false)}>
                Password updated successfully!
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hint="Must be at least 8 characters"
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <Button type="submit" isLoading={passwordSaving}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Arabic Font Size */}
              <div>
                <label className="form-label">Arabic Text Size</label>
                <div className="flex gap-2">
                  {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors data-[active=true]:bg-primary-600 data-[active=true]:text-white"
                      data-active={size === 'Large'}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Translation Hints */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Translation Hints</p>
                  <p className="text-sm text-gray-500">Display word-by-word hints while practicing</p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition" />
                </button>
              </div>

              {/* Daily Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Daily Practice Reminder</p>
                  <p className="text-sm text-gray-500">Get notified to maintain your streak</p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked="false"
                >
                  <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white transition" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-error-200">
          <CardHeader>
            <CardTitle className="text-error-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
              <Button variant="danger">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
