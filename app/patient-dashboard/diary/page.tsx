import DiaryPage from '@/components/DiaryPage'
import PatientNavbar from '@/components/patient/PatientNavbar'
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer'

export default function PatientDiaryPage() {
  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />
      <div className="pt-20">
        <DiaryPage role="patient" />
      </div>
    </NeuralNetworkContainer>
  )
}
