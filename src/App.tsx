"use client"

import { useEffect, useState } from "react"

interface Player {
    id: number
    player: string
    team: string
    pos: string
    g: number
    gs: number
    mp: number
    pts: number
    ast: number
    trb: number
    stl: number
    blk: number
    tov: number
    awards: string
    playerAdditional: string
}

const positionColors: Record<string, { bg: string; text: string; gradient: string }> = {
    PG: { bg: "bg-blue-200", text: "text-blue-800", gradient: "from-blue-300 to-blue-100" },
    SG: { bg: "bg-green-200", text: "text-green-800", gradient: "from-green-300 to-green-100" },
    SF: { bg: "bg-yellow-200", text: "text-yellow-800", gradient: "from-yellow-300 to-yellow-100" },
    PF: { bg: "bg-pink-200", text: "text-pink-800", gradient: "from-pink-300 to-pink-100" },
    C: { bg: "bg-purple-200", text: "text-purple-800", gradient: "from-purple-300 to-purple-100" },
}

// Function to get color based on stat value
const statColor = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage > 70) return "bg-green-400"
    if (percentage > 40) return "bg-yellow-400"
    return "bg-red-400"
}

export default function App() {
    const [players, setPlayers] = useState<Player[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPosition, setSelectedPosition] = useState<string>("ALL")
    const [filterAward, setFilterAward] = useState<string>("ALL")

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch("http://localhost:8080/players")
                if (!res.ok) throw new Error("Failed to fetch players")
                const data = await res.json()
                setPlayers(data)
            } catch (err) {
                console.error(err)
                setError("Failed to fetch players from backend")
            } finally {
                setLoading(false)
            }
        }
        fetchPlayers()
    }, [])

    const filteredPlayers = players.filter((p) => {
        const matchesSearch = p.player.toLowerCase().includes(search.toLowerCase())
        const matchesPosition = selectedPosition === "ALL" || p.pos === selectedPosition
        const matchesAward =
            filterAward === "ALL" || (p.awards && p.awards.toLowerCase().includes(filterAward.toLowerCase()))
        return matchesSearch && matchesPosition && matchesAward
    })

    const getStatPercentage = (value: number, max: number) => Math.min((value / max) * 100, 100)

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xl text-gray-700">Loading Elite Players...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl text-red-700">⚠️</span>
                    </div>
                    <p className="text-xl text-red-700">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-8 text-center">NBA Elite Analytics</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder-gray-400"
                    />

                    <div className="flex gap-2 flex-wrap">
                        {["ALL", "PG", "SG", "SF", "PF", "C"].map((pos) => (
                            <button
                                key={pos}
                                onClick={() => setSelectedPosition(pos)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                    selectedPosition === pos
                                        ? "bg-blue-300 text-blue-900 shadow-lg"
                                        : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-900"
                                }`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>

                    <select
                        value={filterAward}
                        onChange={(e) => setFilterAward(e.target.value)}
                        className="px-4 py-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="ALL">All Awards</option>
                        <option value="Champion">Champion</option>
                        <option value="MVP">MVP</option>
                        <option value="All-Star">All-Star</option>
                    </select>
                </div>

                {/* Player Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPlayers.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                        >
                            {/* Header */}
                            <div className={`p-4 rounded-t-lg bg-gradient-to-r ${positionColors[p.pos]?.gradient}`}>
                                <h2 className="text-lg font-bold text-gray-900">{p.player}</h2>
                                <p className="text-gray-700 text-sm">{p.playerAdditional}</p>
                                <div className="flex justify-between mt-2 text-sm font-semibold">
                                    <span>{p.team}</span>
                                    <span>{p.pos}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="p-4 space-y-3">
                                {[
                                    { label: "PTS", value: p.pts, max: 40 },
                                    { label: "AST", value: p.ast, max: 15 },
                                    { label: "REB", value: p.trb, max: 15 },
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{stat.label}</span>
                                            <span>{stat.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${statColor(stat.value, stat.max)} h-2 rounded-full transition-all duration-1000`}
                                                style={{ width: `${getStatPercentage(stat.value, stat.max)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Awards */}
                                {p.awards && (
                                    <div className="pt-3">
                                        <div className="flex flex-wrap gap-1">
                                            {p.awards.split("-").map((award, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-blue-400 to-green-400 hover:scale-105 transform transition-all"
                                                >
                          {award}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPlayers.length === 0 && (
                    <div className="text-center py-16 text-gray-700">
                        <h3 className="text-xl font-semibold mb-2">No Players Found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}
