"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface FamilyTreeData {
  nodes: Array<{ id: string; gender: string }>
  links: Array<{ source: string; target: string }>
}

interface Props {
  data: FamilyTreeData
  onNodeClick: (personName: string) => void
  focusedPerson: string | null
  getPersonColor: (name: string) => string
}

interface TreeNode {
  id: string
  data: any
  children: TreeNode[]
  parent?: TreeNode
  x: number
  y: number
  width: number // Width needed for this subtree
}

export default function FamilyTreeChart({ data, onNodeClick, focusedPerson, getPersonColor }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Update canvas size based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = Math.max(600, window.innerHeight * 0.6) // At least 600px, or 60% of viewport height

        setDimensions({
          width: Math.max(600, containerWidth - 40), // At least 400px, with some padding
          height: containerHeight,
        })
      }
    }

    // Initial size
    updateDimensions()

    // Listen for window resize
    window.addEventListener("resize", updateDimensions)

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { width, height } = dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    svg.attr("width", width).attr("height", height)

    // Add arrow marker definition
    const defs = svg.append("defs")
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#666")

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Node dimensions - responsive based on screen size
    const nodeWidth = width < 1024 ? 120 : 120 // Smaller nodes on smaller screens
    const nodeHeight = width < 1024 ? 40 : 50
    const minNodeSpacing = width < 768 ? 15 : 20 // Tighter spacing on mobile
    const levelHeight = width < 768 ? 90 : 120 // Less vertical space on mobile

    // Create hierarchical structure
    const nodeMap = new Map()
    data.nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [], parents: [] })
    })

    // Build parent-child relationships
    data.links.forEach((link) => {
      const parent = nodeMap.get(link.source)
      const child = nodeMap.get(link.target)
      if (parent && child) {
        parent.children.push(child)
        child.parents.push(parent)
      }
    })

    // Find root nodes (nodes with no parents)
    const roots = Array.from(nodeMap.values()).filter((node: any) => node.parents.length === 0)

    const allNodes: TreeNode[] = []
    const allLinks: any[] = []

    // Separate isolated nodes (nodes with no relationships) from connected nodes
    const isolatedNodes = Array.from(nodeMap.values()).filter(
      (node: any) => node.children.length === 0 && node.parents.length === 0,
    )

    // Constants for isolated nodes column
    const isolatedColumnWidth = nodeWidth + 40 // Width reserved for isolated nodes column
    const isolatedColumnX = -(width - margin.left - margin.right) / 2 + isolatedColumnWidth / 2 // Left side position
    const isolatedStartY = 60 // Start from top
    const isolatedVerticalSpacing = nodeHeight + 15 // Vertical spacing between isolated nodes

    // Position isolated nodes in a vertical column on the left
    isolatedNodes.forEach((node: any, index) => {
      const treeNode: TreeNode = {
        id: node.id,
        data: node,
        children: [],
        x: isolatedColumnX,
        y: isolatedStartY + index * isolatedVerticalSpacing,
        width: nodeWidth,
      }
      allNodes.push(treeNode)
    })

    // Function to calculate subtree width
    function calculateSubtreeWidth(node: any): number {
      if (node.children.length === 0) {
        return nodeWidth + minNodeSpacing
      }

      // Calculate total width needed for all children
      const childrenWidth = node.children.reduce((total: number, child: any) => {
        return total + calculateSubtreeWidth(child)
      }, 0)

      // Return the maximum of node width or children width
      return Math.max(nodeWidth + minNodeSpacing, childrenWidth)
    }

    // Function to position nodes in a subtree
    function positionSubtree(node: any, x: number, y: number, availableWidth: number): TreeNode {
      const treeNode: TreeNode = {
        id: node.id,
        data: node,
        children: [],
        x: x,
        y: y,
        width: calculateSubtreeWidth(node),
      }

      if (node.children.length > 0) {
        // Calculate positions for children
        let childX = x - treeNode.width / 2

        node.children.forEach((child: any) => {
          const childWidth = calculateSubtreeWidth(child)
          const childTreeNode = positionSubtree(child, childX + childWidth / 2, y + levelHeight, childWidth)
          childTreeNode.parent = treeNode
          treeNode.children.push(childTreeNode)

          // Add link
          allLinks.push({
            source: treeNode,
            target: childTreeNode,
          })

          childX += childWidth
        })

        // Center parent over children
        if (treeNode.children.length > 0) {
          const firstChild = treeNode.children[0]
          const lastChild = treeNode.children[treeNode.children.length - 1]
          treeNode.x = (firstChild.x + lastChild.x) / 2
        }
      }

      allNodes.push(treeNode)
      return treeNode
    }

    // Process connected nodes (excluding isolated nodes)
    const rootsWithRelationships = roots.filter((root: any) => root.children.length > 0 || root.parents.length > 0)

    if (rootsWithRelationships.length > 0) {
      let totalRootWidth = 0
      const rootWidths: number[] = []

      // Calculate width needed for each root tree
      rootsWithRelationships.forEach((root: any) => {
        const rootWidth = calculateSubtreeWidth(root)
        rootWidths.push(rootWidth)
        totalRootWidth += rootWidth
      })
      // Calculate the starting X position for the main tree (offset to avoid isolated nodes column)
      const mainTreeStartX = isolatedColumnWidth + 50 - totalRootWidth / 2 // Start after isolated column with some padding
      // Position each root tree in the main area
      let currentX = mainTreeStartX
      rootsWithRelationships.forEach((root: any, index: number) => {
        const rootWidth = rootWidths[index]
        positionSubtree(root, currentX + rootWidth / 2, 60, rootWidth)
        currentX += rootWidth
      })
    }

    // Create links with proper elbow connections
    const link = g
      .append("g")
      .selectAll("path")
      .data(allLinks)
      .enter()
      .append("path")
      .attr("stroke", "#666")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)")
      .attr("d", (d: any) => {
        const sourceX = d.source.x
        const sourceY = d.source.y + nodeHeight / 2
        const targetX = d.target.x
        const targetY = d.target.y - nodeHeight / 2 - 10

        const midY = sourceY + (targetY - sourceY) / 2

        return `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`
      })

    // Create rectangular nodes
    const node = g
      .append("g")
      .selectAll("rect")
      .data(allNodes)
      .enter()
      .append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", (d: TreeNode) => d.x - nodeWidth / 2)
      .attr("y", (d: TreeNode) => d.y - nodeHeight / 2)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (d: TreeNode) => getPersonColor(d.data.id))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")

    // Add labels with responsive font size
    const fontSize = width < 768 ? "10px" : "12px"
    const maxNameLength = width < 768 ? 15 : 15

    const labels = g
      .append("g")
      .selectAll("text")
      .data(allNodes)
      .enter()
      .append("text")
      .text((d: TreeNode) => {
        const name = d.data.id
        return name.length > maxNameLength ? name.substring(0, maxNameLength - 3) + "..." : name
      })
      .attr("font-size", fontSize)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("pointer-events", "none")
      .style("font-weight", "bold")
      .attr("x", (d: TreeNode) => d.x)
      .attr("y", (d: TreeNode) => d.y)

    // Handle node clicks
    node.on("click", (event, d: TreeNode) => {
      onNodeClick(d.data.id)
    })

    // Highlight focused person
    if (focusedPerson) {
      node
        .attr("stroke", (d: TreeNode) => (d.data.id === focusedPerson ? "#ff6b6b" : "#fff"))
        .attr("stroke-width", (d: TreeNode) => (d.data.id === focusedPerson ? 4 : 2))
    }

    // Add zoom and pan functionality
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom as any)

    // Auto-fit to show all nodes
    if (allNodes.length > 0) {
      const xExtent = d3.extent(allNodes, (d: TreeNode) => d.x) as [number, number]
      const yExtent = d3.extent(allNodes, (d: TreeNode) => d.y) as [number, number]

      const dx = xExtent[1] - xExtent[0] + nodeWidth + 100
      const dy = yExtent[1] - yExtent[0] + nodeHeight + 100

      const scale = Math.min((width - margin.left - margin.right) / dx, (height - margin.top - margin.bottom) / dy, 0.8)

      const centerX = (xExtent[0] + xExtent[1]) / 2
      const centerY = (yExtent[0] + yExtent[1]) / 2

      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-centerX, -centerY)

      svg.call(zoom.transform as any, transform)
    }

    // Center the view on focused person
    if (focusedPerson) {
      const focusedNode = allNodes.find((n: TreeNode) => n.data.id === focusedPerson)
      if (focusedNode) {
        const transform = d3.zoomIdentity.translate(width / 2 - focusedNode.x, height / 2 - focusedNode.y).scale(1)
        svg
          .transition()
          .duration(750)
          .call(zoom.transform as any, transform)
      }
    }
  }, [data, focusedPerson, getPersonColor, onNodeClick, dimensions])

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      <svg ref={svgRef} className="border rounded-lg bg-white"></svg>
      <div className="mt-2 text-sm text-gray-600 flex items-center justify-center space-x-4 flex-wrap">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          <span>Male</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-pink-200 rounded-full"></div>
          <span>Female</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
          <span>No relationships</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>→</span>
          <span>Parent to Child</span>
        </div>
      </div>
    </div>
  )
}
