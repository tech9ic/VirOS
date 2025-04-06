import { useState } from 'react';
import TicketForm from '@/components/TicketForm';
import TicketWall from '@/components/TicketWall';
import MobileTicketForm from '@/components/MobileTicketForm';
import { Plus } from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans bg-secondary min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-neutral-dark">Ticket Wall</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition duration-200 md:hidden"
          >
            <Plus className="inline-block mr-2 h-4 w-4" />
            Create
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:grid md:grid-cols-12 md:gap-8">
        {/* Ticket Form - Desktop */}
        <section className="md:col-span-4 lg:col-span-3 mb-8 md:mb-0 hidden md:block">
          <TicketForm />
        </section>

        {/* Ticket Wall */}
        <section className="md:col-span-8 lg:col-span-9">
          <TicketWall />
        </section>
      </main>

      {/* Mobile Ticket Form Modal */}
      <MobileTicketForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
