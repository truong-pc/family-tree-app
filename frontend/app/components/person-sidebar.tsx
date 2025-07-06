"use client"

import { useState } from "react"
import { X, User, Users, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AddChildModal from "./add-child-modal"
import { api } from "@/lib/api"

interface Person {
  name: string
  gender: string
  desc?: string
}

interface FamilyTreeData {
  nodes: Array<{ id: string; gender: string }>
  links: Array<{ source: string; target: string }>
}

interface Props {
  person: Person | null
  isOpen: boolean
  onClose: () => void
  familyTreeData: FamilyTreeData
  onDataUpdate: () => void
}

export default function PersonSidebar({ person, isOpen, onClose, familyTreeData, onDataUpdate }: Props) {
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!person) return null

  console.log(person);

  // Delete person function
  const deletePerson = async () => {
    if (!confirm(`Are you sure you want to delete ${person.name}? This will also remove all their relationships.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await api.deletePerson(person.name)
      onDataUpdate() // Refresh data after successful deletion
      onClose() // Close sidebar
    } catch (error) {
      console.error("Error deleting person:", error)
      alert("Failed to delete person. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Get parents and children
  const parents = familyTreeData.links.filter((link) => link.target === person.name).map((link) => link.source)

  const children = familyTreeData.links.filter((link) => link.source === person.name).map((link) => link.target)

  return (
    <>
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Person Details</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={deletePerson}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Basic Information</span>
            </div>
            <div className="pl-7 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium">{person.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Gender:</span>
                <Badge variant="secondary" className="ml-2">
                  {person.gender}
                </Badge>
              </div>
              {person.desc && (
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="text-sm mt-1">{person.desc}</p>
                </div>
              )}
            </div>
          </div>

          {/* Parents */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Parents ({parents.length})</span>
            </div>
            <div className="pl-7">
              {parents.length > 0 ? (
                <div className="space-y-2">
                  {parents.map((parent, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      {parent}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No parents recorded</p>
              )}
            </div>
          </div>

          {/* Children */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Children ({children.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddChildModal(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Child
              </Button>
            </div>
            <div className="pl-7">
              {children.length > 0 ? (
                <div className="space-y-2">
                  {children.map((child, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      {child}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No children recorded</p>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          {/* <div className="border-t pt-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-600">Danger</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800">Delete Person</h4>
                    <p className="text-sm text-red-600 mt-1">
                      This will permanently delete {person.name} and all their relationships. This action cannot be
                      undone.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deletePerson}
                      disabled={isDeleting}
                      className="mt-3"
                    >
                      {isDeleting ? "Deleting..." : "Delete Person"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        parentName={person.name}
        onSuccess={() => {
          onDataUpdate()
          setShowAddChildModal(false)
        }}
      />
    </>
  )
}
