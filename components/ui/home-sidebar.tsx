import { Home, Inbox, Calendar, Search, Settings, User2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"

interface SidebarProps {
  username: string
  className?: string
}

// Menu items.
const items = [
  { title: "Home", url: "/home", icon: Home},
  { title: "Song Discovery", url: "/song-discovery", icon: Search},
  { title: "My Library", url: "/song-library", icon: Inbox},
]


export function HomeSidebar({ username, className }: SidebarProps) {
  return (
  <Sidebar collapsible="icon" className={`fixed ${className}`}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem >
              <SidebarTrigger />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent >
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/profile">
                <User2 /> 
                {username} 
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
