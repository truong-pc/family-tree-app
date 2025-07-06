const API_BASE_URL = "http://127.0.0.1:5000"

export const api = {
  // Get all family tree data
  getFamilyTree: async () => {
    const response = await fetch(`${API_BASE_URL}/get_family_tree`)
    if (!response.ok) {
      throw new Error("Failed to fetch family tree")
    }
    return response.json()
  },

  // Add a new person
  addPerson: async (name: string, gender: string, description?: string) => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("gender", gender)
    if (description) {
      formData.append("description", description)
    }

    const response = await fetch(`${API_BASE_URL}/add_person`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to add person")
    }
    return response.json()
  },

  // Add a relationship
  addRelationship: async (parent: string, child: string) => {
    const formData = new FormData()
    formData.append("parent", parent)
    formData.append("child", child)

    const response = await fetch(`${API_BASE_URL}/add_relationship`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to add relationship")
    }
    return response.json()
  },

  // Add a child
  addChild: async (parent: string, child: string, gender: string, desc?: string) => {
    const response = await fetch(`${API_BASE_URL}/add_child`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent,
        child,
        gender,
        desc,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to add child")
    }
    return response.json()
  },

  // Search for people
  searchPerson: async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/search_person?name=${encodeURIComponent(name)}`)
    if (!response.ok) {
      throw new Error("Failed to search person")
    }
    return response.json()
  },

  // Delete a person
  deletePerson: async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/delete_person/${encodeURIComponent(name)}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete person")
    }
    return response.json()
  },
}
