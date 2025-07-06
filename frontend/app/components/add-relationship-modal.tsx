"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api"

interface Person {
  name: string
  gender: string
  desc?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  people: Person[]
}

export default function AddRelationshipModal({ isOpen, onClose, onSuccess, people }: Props) {
  const [parent, setParent] = useState("")
  const [child, setChild] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parent || !child || parent === child) return

    setLoading(true)
    try {
      await api.addRelationship(parent, child)
      setParent("")
      setChild("")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error adding relationship:", error)
      alert("Failed to add relationship. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="parent">Parent</Label>
            <Select value={parent} onValueChange={setParent} required>
              <SelectTrigger>
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person, index) => (
                  <SelectItem key={index} value={person.name}>
                    {person.name} ({person.gender})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="child">Child</Label>
            <Select value={child} onValueChange={setChild} required>
              <SelectTrigger>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person, index) => (
                  <SelectItem key={index} value={person.name}>
                    {person.name} ({person.gender})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !parent || !child || parent === child}>
              {loading ? "Adding..." : "Add Relationship"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
