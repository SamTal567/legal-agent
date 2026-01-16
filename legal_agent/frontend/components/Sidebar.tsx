"use client"

import { useRouter } from "next/navigation"
import {
  DoorOpen,
  MessageSquare,
  Plus,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function AppSidebar() {
  const router = useRouter()

  return (
    <Sidebar
      collapsible="icon"
      className="
        fixed top-0 left-0 
        h-screen 
        border-r 
        bg-white 
        z-40
      "
    >
      {/* // HEADER  */}
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-3">
        <SidebarContent className="font-semibold text-lg">LegalAI</SidebarContent>

        <SidebarTrigger>
          <DoorOpen className="h-5 w-5" />
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <MessageSquare className="h-4 w-4" />
              <span>First Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.refresh()}>
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
