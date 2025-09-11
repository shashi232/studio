"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import type { EmergencyContact } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, User, Trash2, Edit, X } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Use E.164 format, e.g., +1234567890" }),
});

export default function SosContacts() {
  const [contacts, setContacts] = useLocalStorage<EmergencyContact[]>('sos-contacts', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '' },
  });

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...values } : c));
    } else {
      setContacts([...contacts, { id: uuidv4(), ...values }]);
    }
    form.reset();
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    form.reset(contact);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };
  
  const openAddDialog = () => {
    setEditingContact(null);
    form.reset({ name: '', phone: '' });
    setIsDialogOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>SOS Contacts</CardTitle>
            <CardDescription>Manage your emergency contacts.</CardDescription>
          </div>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No emergency contacts added yet.</p>
              <p>Add one to get started.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-full p-2">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Contact</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Contact</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {contact.name} from your emergency contacts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(contact.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update the details for your emergency contact.' : 'Enter the details for your new emergency contact.'}
            </DialogDescription>
          </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter>
                    <Button type="submit">Save Contact</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
      </Dialog>
    </>
  );
}
