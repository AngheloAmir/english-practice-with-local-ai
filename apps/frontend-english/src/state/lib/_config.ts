import type { SoftwareModule } from "./_types";



export const SOFTWARE_MODULES : SoftwareModule[] = [
    {
        id: "0",
        name: "Dashboard",
        icon: "🎯",
        description: "Dashboard",
        color: "bg-red-500",
        active: true,
        route: "/dashboard"
    },
    {
        id: "1",
        name: "Reading Practice",
        icon: "📚",
        description: "Improve your reading skills with various articles and texts.",
        color: "bg-blue-500",
        active: true,
        route: "/reading",
    },
    {
        id: "2",
        name: "Vocabulary Practice",
        icon: "📖",
        description: "Expand your vocabulary with new words and phrases.",
        color: "bg-green-500",
        active: true,
        route: "/vocabulary",
    },
    {   
        id: "3",
        name: "Grammar Practice",
        icon: "📝",
        description: "Strengthen your grammar skills with exercises and examples.",
        color: "bg-purple-500",
        active: true,
        route: "/grammar",
    },
]
