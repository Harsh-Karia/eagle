import type { Project, ProjectMember } from './App';

// Demo team members
export const demoTeamMembers: Record<string, ProjectMember[]> = {
  '1': [ // Downtown Transit Hub
    {
      id: 'member-1-1',
      name: 'Sarah Chen, PE',
      email: 'sarah.chen@example.com',
      role: 'senior',
      joinedAt: new Date(2024, 0, 15),
    },
    {
      id: 'member-1-2',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'junior',
      joinedAt: new Date(2024, 0, 16),
    },
    {
      id: 'member-1-3',
      name: 'Michael Park, PE',
      email: 'michael.park@example.com',
      role: 'senior',
      joinedAt: new Date(2024, 0, 18),
    },
    {
      id: 'member-1-4',
      name: 'Jessica Martinez',
      email: 'jessica.martinez@example.com',
      role: 'junior',
      joinedAt: new Date(2024, 0, 20),
    },
  ],
  '2': [ // River Walk Development
    {
      id: 'member-2-1',
      name: 'Sarah Chen, PE',
      email: 'sarah.chen@example.com',
      role: 'senior',
      joinedAt: new Date(2024, 1, 3),
    },
    {
      id: 'member-2-2',
      name: 'David Kim',
      email: 'david.kim@example.com',
      role: 'junior',
      joinedAt: new Date(2024, 1, 4),
    },
    {
      id: 'member-2-3',
      name: 'Emily Watson, PE',
      email: 'emily.watson@example.com',
      role: 'senior',
      joinedAt: new Date(2024, 1, 5),
    },
  ],
  '3': [ // Highland Residential Subdivision
    {
      id: 'member-3-1',
      name: 'Sarah Chen, PE',
      email: 'sarah.chen@example.com',
      role: 'senior',
      joinedAt: new Date(2023, 11, 10),
    },
    {
      id: 'member-3-2',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'junior',
      joinedAt: new Date(2023, 11, 11),
    },
    {
      id: 'member-3-3',
      name: 'Robert Thompson, PE',
      email: 'robert.thompson@example.com',
      role: 'senior',
      joinedAt: new Date(2023, 11, 12),
    },
    {
      id: 'member-3-4',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      role: 'junior',
      joinedAt: new Date(2023, 11, 15),
    },
    {
      id: 'member-3-5',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      role: 'junior',
      joinedAt: new Date(2023, 11, 18),
    },
  ],
};

// Demo project notes
export const demoProjectNotes: Record<string, string> = {
  '1': `**Project Kickoff Meeting - January 15, 2024**

Key decisions made:
- Underground parking structure will use post-tensioned concrete system
- Coordination required with transit authority for platform integration
- Environmental review completed, awaiting final approval

**Status Update - January 20, 2024**

- Site survey completed, all benchmarks verified
- Geotechnical report received - soil conditions favorable
- Structural engineer review scheduled for next week

**Critical Items - January 25, 2024**

⚠️ High priority: Resolve elevation conflicts between parking level and transit platform
- Need to coordinate with MEP team for ventilation requirements
- Fire code compliance review pending

**Progress Update - February 1, 2024**

- 8 issues identified, 2 resolved
- Focus areas: ADA compliance and structural coordination
- Next milestone: Submit for building permit by end of month`,

  '2': `**Project Initiation - February 3, 2024**

Project scope:
- 1.2 mile riverwalk with boardwalk sections
- Flood control improvements including retention basins
- Coordination with city parks department required

**Environmental Considerations - February 5, 2024**

- Wetland delineation completed
- No impacts to protected areas identified
- Stormwater management plan approved by city

**Design Coordination - February 10, 2024**

- Landscape architect provided plant species list
- Riprap specifications finalized for erosion control
- Pedestrian bridge design coordination ongoing

**Current Status - February 15, 2024**

- 7 issues identified, 1 resolved
- Main focus: FEMA flood elevation compliance
- Awaiting final approval from water resources department`,

  '3': `**Project Completion Summary - December 2023**

This project was successfully completed with all 23 issues resolved.

**Final Project Notes:**

✅ All grading and drainage work completed per specifications
✅ Final inspections passed - all code compliance requirements met
✅ As-built drawings submitted to city
✅ Final payment processed

**Key Achievements:**
- Completed ahead of schedule
- Zero safety incidents
- All quality standards exceeded
- Client satisfaction rating: 5/5

**Lessons Learned:**
- Early coordination with utility companies critical
- Regular site visits prevented costly rework
- Effective use of AI-assisted review reduced review time by 60%

**Project Closed - December 22, 2023**`,
};

