"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users, Trash2, X } from "lucide-react"
import FamilyTreeChart from "./components/family-tree-chart"
import PersonSidebar from "./components/person-sidebar"
import AddPersonModal from "./components/add-person-modal"
import AddRelationshipModal from "./components/add-relationship-modal"
import { api } from "@/lib/api"
import { API_BASE_URL } from "@/lib/config"

interface Person {
  name: string
  gender: string
  desc?: string
}

interface FamilyTreeData {
  nodes: Array<{ id: string; gender: string }>
  links: Array<{ source: string; target: string }>
}

export default function FamilyTreeApp() {
  const [people, setPeople] = useState<Person[]>([])
  const [familyTreeData, setFamilyTreeData] = useState<FamilyTreeData>({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)
  const [showAddRelationshipModal, setShowAddRelationshipModal] = useState(false)
  const [focusedPerson, setFocusedPerson] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all people and family tree data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const treeData = await api.getFamilyTree()
      setFamilyTreeData(treeData)

      // Extract people from nodes
      const peopleData = treeData.nodes.map((node: any) => ({
        name: node.id,
        gender: node.gender,
        desc: node.desc || "",
      }))
      setPeople(peopleData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load family tree data. Please check if the server is running.")
    } finally {
      setLoading(false)
    }
  }

  // Search for people
  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.trim()) {
      try {
        const data = await api.searchPerson(term)
        setSearchResults(data.results || [])
      } catch (error) {
        console.error("Error searching:", error)
        setSearchResults([])
      }
    } else {
      setSearchResults([])
      // Clear focused person when search is cleared
      setFocusedPerson(null)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setFocusedPerson(null) // Remove red border from focused person
  }

  // Delete a person
  const deletePerson = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    try {
      await api.deletePerson(name)
      await fetchData() // Refresh data after successful deletion
      // Close sidebar if the deleted person was selected
      if (selectedPerson?.name === name) {
        setSidebarOpen(false)
        setSelectedPerson(null)
      }
      // Clear focus if the deleted person was focused
      if (focusedPerson === name) {
        setFocusedPerson(null)
      }
    } catch (error) {
      console.error("Error deleting person:", error)
      alert("Failed to delete person. Please try again.")
    }
  }

  // Handle node click in chart
  const handleNodeClick = (personName: string) => {
    const person = people.find((p) => p.name === personName)
    if (person) {
      setSelectedPerson(person)
      setSidebarOpen(true)
    }
  }

  // Handle search result click
  const handleSearchResultClick = (person: Person) => {
    setFocusedPerson(person.name)
    setSearchTerm(person.name) // Show the selected person's name in search bar
    setSearchResults([])
  }

  // Get person color based on gender and relationships
  const getPersonColor = (person: Person) => {
    const hasRelationships = familyTreeData.links.some(
      (link) => link.source === person.name || link.target === person.name,
    )

    if (!hasRelationships) return "#FEF3C7" // light yellow
    return person.gender.toLowerCase() === "male" ? "#DBEAFE" : "#FCE7F3" // blue or pink
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family tree...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Users className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Family Tree</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-500">API:{API_BASE_URL}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search family members..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-64"
                />
                {/* Clear search button */}
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 mt-1">
                    {searchResults.map((person, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleSearchResultClick(person)}
                      >
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm text-gray-500">{person.gender}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Button onClick={() => setShowAddPersonModal(true)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Person</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddRelationshipModal(true)}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Add Relationship</span>
                <span className="sm:hidden">Relation</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
            {/* Family Tree Visualization */}
            <Card className="mb-4 sm:mb-8">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Family Tree Visualization</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <FamilyTreeChart
                  data={familyTreeData}
                  onNodeClick={handleNodeClick}
                  focusedPerson={focusedPerson}
                  getPersonColor={(name) => {
                    const person = people.find((p) => p.name === name)
                    return person ? getPersonColor(person) : "#F3F4F6"
                  }}
                />
              </CardContent>
            </Card>

            {/* People List */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Family Members ({people.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
                  {people.map((person, index) => (
                    <div
                      key={index}
                      className="p-2 sm:p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
                      style={{ backgroundColor: getPersonColor(person) }}
                      onClick={() => handleNodeClick(person.name)}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{person.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {person.gender}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePerson(person.name)
                        }}
                        className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 sm:p-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {people.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No family members yet</h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-4">
                      Get started by adding your first family member
                    </p>
                    <Button onClick={() => setShowAddPersonModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Person
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Person Details Sidebar */}
        <PersonSidebar
          person={selectedPerson}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          familyTreeData={familyTreeData}
          onDataUpdate={fetchData}
        />
      </div>

      {/* Modals */}
      <AddPersonModal isOpen={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} onSuccess={fetchData} />

      <AddRelationshipModal
        isOpen={showAddRelationshipModal}
        onClose={() => setShowAddRelationshipModal(false)}
        onSuccess={fetchData}
        people={people}
      />
    </div>
  )
}
