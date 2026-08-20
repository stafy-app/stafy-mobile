// app/(tabs)/dashboard.tsx

import {View, Text, ScrollView, Alert} from "react-native";

import {Clock, Wallet} from "lucide-react-native";

import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";
import HeaderThemed from "@/src/components/ui/HeaderThemed";

import InfoCard from "@/src/components/dashboard/InfoCard";
import IncomingInvitationCard from "@/src/components/dashboard/IncomingInvitationCard";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
import {api} from "@/src/services/api";
import {getItem, deleteItem} from "@/src/services/storage";
import {PieChart} from "react-native-gifted-charts";
import PieChartData from "@/src/components/dashboard/PieChartData";
import {DashboardData, IncomingInvitation, TimeEntry} from "@/src/types/api";
import useUser from "@/src/hooks/useUser";

export default function DashboardScreen() {

    const {refreshProfile} = useUser();

    const [totalHours, setTotalHours] = useState<number>(0)
    const [totalMoney, setTotalMoney] = useState<string>("0")
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
    const [invitations, setInvitations] = useState<IncomingInvitation[]>([])
    const [respondingId, setRespondingId] = useState<string | null>(null)
    const [respondingAction, setRespondingAction] = useState<"accept" | "reject" | null>(null)

    const fetchDashboard = useCallback(async () => {
        try {
            const response = await api.get<DashboardData>("/api/v1/dashboard/me")

            console.log("[INFO] Data fetched successfully", response.data)

            setTotalHours(response.data.total_hours)
            setTotalMoney(response.data.total_gross_salary)
            setTimeEntries(response.data.time_entries)
        } catch (error) {
            console.error("Failed to fetch data", error)
        }
    }, [])

    const fetchInvitations = useCallback(async () => {
        try {
            const response = await api.get<{ data: IncomingInvitation[] }>("/api/v1/invitations/me")
            setInvitations(response.data.data)
        } catch (error) {
            console.error("Failed to fetch incoming invitations", error)
        }
    }, [])

    // Set by UserContext.register() when registration auto-joined an inviting
    // manager's company — surfaced here (not at register time) because the app
    // shows a "Cont creat cu succes!" popup and redirects to /login first; this
    // is the first dashboard mount after that. Cleared immediately so it only
    // ever shows once, not on every subsequent app open.
    const checkPendingJoinAlert = useCallback(async () => {
        const companyName = await getItem('stafy_pendingJoinAlert')
        if (companyName) {
            await deleteItem('stafy_pendingJoinAlert')
            Alert.alert("Bun venit!", `Ai fost adăugat cu succes în echipa ${companyName}.`)
        }
    }, [])

    useFocusEffect(
        useCallback(() => {
            fetchDashboard()
            fetchInvitations()
            checkPendingJoinAlert()
        }, [fetchDashboard, fetchInvitations, checkPendingJoinAlert])
    )

    async function handleAccept(invitation: IncomingInvitation) {
        setRespondingId(invitation.id)
        setRespondingAction("accept")
        try {
            await api.post(`/api/v1/invitations/${invitation.id}/accept`)
            setInvitations((current) => current.filter((i) => i.id !== invitation.id))
            // company_id/manager_id just changed server-side — refresh the cached
            // profile and this month's data so the new company shows immediately,
            // not on next cold start.
            await refreshProfile()
            await fetchDashboard()
            Alert.alert("Bun venit!", `Ai fost adăugat cu succes în echipa ${invitation.company_name}.`)
        } catch (error) {
            console.error("Failed to accept invitation", error)
            const detail = (error as any)?.response?.data?.detail
            Alert.alert("Eroare", detail || "Nu am putut accepta invitația. Te rog încearcă din nou.")
        } finally {
            setRespondingId(null)
            setRespondingAction(null)
        }
    }

    async function handleReject(invitation: IncomingInvitation) {
        setRespondingId(invitation.id)
        setRespondingAction("reject")
        try {
            await api.post(`/api/v1/invitations/${invitation.id}/reject`)
            setInvitations((current) => current.filter((i) => i.id !== invitation.id))
        } catch (error) {
            console.error("Failed to reject invitation", error)
            const detail = (error as any)?.response?.data?.detail
            Alert.alert("Eroare", detail || "Nu am putut respinge invitația. Te rog încearcă din nou.")
        } finally {
            setRespondingId(null)
            setRespondingAction(null)
        }
    }

    return (
        <SafeScreenWrapper>
            <ScrollView className={"bg-secondary-50"}>
                {/* Header Section */}
                <View>
                    <HeaderThemed/>
                </View>

                {/* Incoming Invitations Section */}
                {invitations.length > 0 && (
                    <View className={"mt-6 gap-3"}>
                        {invitations.map((invitation) => (
                            <IncomingInvitationCard
                                key={invitation.id}
                                invitation={invitation}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                isAccepting={respondingId === invitation.id && respondingAction === "accept"}
                                isRejecting={respondingId === invitation.id && respondingAction === "reject"}
                            />
                        ))}
                    </View>
                )}

                {/* Time Section */}
                <View className={"mt-10"}>
                    <InfoCard title={"Luna aceasta"} value={totalHours.toString() + "h"} Icon={Clock}/>
                </View>

                {/* Money Section */}
                <View className={"mt-10"}>
                    <InfoCard title={"Salariu estimativ brut"} value={totalMoney.toString() + " RON"} Icon={Wallet}/>
                </View>

                {/* Pie Chart Section */}
                <View className={"my-10 px-4"}>
                    <PieChartData timeEntries={timeEntries} timeTotal={totalHours}/>
                </View>
            </ScrollView>
        </SafeScreenWrapper>
    )

}
