// src/pages/admin/SchoolOnboardingPage.jsx (CONTINUED AND COMPLETED)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import Stepper from '../../components/Stepper';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import FileUpload from '../../components/FileUpload';
import { toast } from '../../components/ui/use-toast';
import {
  schoolDetailsSchema,
  classBookConfigSchema,
  principalDetailsSchema,
  teachersSchema,
  // initialContentSchema, // Not using direct schema validation for file for simplicity
} from '../../lib/schema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { CheckCircle, Loader2, X } from 'lucide-react'; // Added X for removing teachers/books dynamically
import { Combobox } from '../../components/ui/combobox'; // Assuming you might want a combobox for class selection

// If you don't have a shadcn combobox, you'd need to create one or use a basic select/multi-select component.
// For now, I'll use a placeholder for it, assuming it would be a multi-select for classIds.
// For a simple demo, we'll use a basic multi-select approach.

const steps = [
  { id: 'school-details', name: 'Step 1', description: 'School Details' },
  { id: 'class-config', name: 'Step 2', description: 'Classes & Books' },
  { id: 'principal', name: 'Step 3', description: 'Principal Info' },
  { id: 'teachers', name: 'Step 4', description: 'Assign Teachers' },
  { id: 'content', name: 'Step 5', description: 'Upload Content' },
  { id: 'review', name: 'Step 6', description: 'Review & Create' },
];

const SchoolOnboardingPage = ({ user }) => {
  const navigate = useNavigate();
  const {
    currentStep,
    onboardingData,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
    updateOnboardingData,
    resetOnboarding,
  } = useOnboardingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newSchoolId, setNewSchoolId] = useState('');

  // Protect route
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to access this page.",
        variant: "destructive",
      });
    }
  }, [user, navigate]);

  // Form for Step 1: School Details
  const schoolDetailsForm = useForm({
    resolver: zodResolver(schoolDetailsSchema),
    defaultValues: onboardingData.schoolDetails || { name: '', address: '', board: '', logoUrl: '' },
  });

  // Form for Step 2: Class & Book Configuration
  const classBookConfigForm = useForm({
    resolver: zodResolver(classBookConfigSchema),
    defaultValues: { classes: onboardingData.classBookConfig.length ? onboardingData.classBookConfig : [{ class: { name: '', grade: '', syllabus: '' }, books: [{ title: '', isbn: '', barcode: '' }] }] },
  });
  const { fields: classFields, append: appendClass, remove: removeClass } = useFieldArray({
    control: classBookConfigForm.control,
    name: 'classes',
  });

  // Form for Step 3: Principal Details
  const principalDetailsForm = useForm({
    resolver: zodResolver(principalDetailsSchema),
    defaultValues: onboardingData.principalDetails || { name: '', email: '', phone: '' },
  });

  // Form for Step 4: Assign Teachers
  const teachersForm = useForm({
    resolver: zodResolver(teachersSchema),
    defaultValues: { teachers: onboardingData.teachers.length ? onboardingData.teachers : [{ name: '', email: '', subject: '', classIds: [] }] },
  });
  const { fields: teacherFields, append: appendTeacher, remove: removeTeacher } = useFieldArray({
    control: teachersForm.control,
    name: 'teachers',
  });

  // Form for Step 5: Initial Content Upload
  const initialContentForm = useForm({
    defaultValues: onboardingData.initialContent || { file: null, fileName: '', fileSize: 0 },
  });

  useEffect(() => {
    // Autosave on form changes (debounce in a real app)
    const subscription1 = schoolDetailsForm.watch((value) => updateOnboardingData('schoolDetails', value));
    const subscription2 = classBookConfigForm.watch((value) => updateOnboardingData('classBookConfig', value.classes));
    const subscription3 = principalDetailsForm.watch((value) => updateOnboardingData('principalDetails', value));
    const subscription4 = teachersForm.watch((value) => updateOnboardingData('teachers', value.teachers));
    const subscription5 = initialContentForm.watch((value) => updateOnboardingData('initialContent', value));

    return () => {
      subscription1.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
      subscription4.unsubscribe();
      subscription5.unsubscribe();
    };
  }, [
    schoolDetailsForm,
    classBookConfigForm,
    principalDetailsForm,
    teachersForm,
    initialContentForm,
    updateOnboardingData,
  ]);

  const handleNext = async (currentForm) => {
    const isValid = await currentForm.trigger(); // Manually trigger validation for current step's form
    if (isValid) {
      goToNextStep();
    } else {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the current step.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      // Prepare data for API call
      const payload = {
        schoolDetails: onboardingData.schoolDetails,
        classBookConfig: onboardingData.classBookConfig.map(cb => ({
          class: cb.class,
          // Assign temp classId for mock, in real backend this would be generated
          books: cb.books.map(book => ({ ...book, classId: cb.class.id || `temp-${Math.random().toString(36).substring(7)}` }))
        })),
        principalDetails: onboardingData.principalDetails,
        teachers: onboardingData.teachers,
        initialContentFileName: onboardingData.initialContent?.file?.name || null,
        // In a real app, you'd upload the actual file to storage (S3/Azure Blob)
        // and send a reference URL here.
      };

      console.log("Submitting payload:", payload);

      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to onboard school.');
      }

      const result = await response.json();
      setNewSchoolId(result.schoolId);
      setShowSuccessDialog(true);
      resetOnboarding(); // Clear form data after successful submission

      toast({
        title: "School Onboarded!",
        description: `School ${onboardingData.schoolDetails.name} has been successfully created. ID: ${result.schoolId}`,
        // variant: "success", // Ensure your toast component supports a 'success' variant
      });

    } catch (error) {
      console.error('Onboarding failed:', error);
      toast({
        title: "Onboarding Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToPrincipalDashboard = () => {
    navigate('/principal/dashboard'); // Or navigate to a specific principal dashboard for the new school
    setShowSuccessDialog(false);
  };

  if (!user || user.role !== 'admin') {
    return (
      <p className="flex justify-center items-center h-screen text-lg text-red-600">
        Access Denied. Please log in as a School Onboarding Admin.
      </p>
    );
  }

  // Helper to get all class IDs for teacher assignment
  const availableClassesForTeachers = onboardingData.classBookConfig.map(cb => ({
    value: cb.class.id || cb.class.name, // Use name as temp ID for mock
    label: `${cb.class.name} (Grade ${cb.class.grade})`
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Onboard New School</h1>
      <Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

      <div className="mt-8 p-8 border rounded-lg shadow-md bg-white">
        {/* Step 1: School Details */}
        {currentStep === 0 && (
          <form onSubmit={schoolDetailsForm.handleSubmit(() => handleNext(schoolDetailsForm))} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">School Details</h2>
            <div>
              <Label htmlFor="name">School Name</Label>
              <Input id="name" {...schoolDetailsForm.register('name')} />
              {schoolDetailsForm.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{schoolDetailsForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...schoolDetailsForm.register('address')} />
              {schoolDetailsForm.formState.errors.address && (
                <p className="text-red-500 text-sm mt-1">{schoolDetailsForm.formState.errors.address.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="board">Board (e.g., CBSE, ICSE)</Label>
              <Input id="board" {...schoolDetailsForm.register('board')} />
              {schoolDetailsForm.formState.errors.board && (
                <p className="text-red-500 text-sm mt-1">{schoolDetailsForm.formState.errors.board.message}</p>
              )}
            </div>
            <div>
              <Controller
                control={schoolDetailsForm.control}
                name="logoUrl"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <FileUpload
                    id="logoUrl"
                    label="School Logo"
                    value={value}
                    onChange={(file) => onChange(file)}
                    accept="image/*"
                    placeholder="Drag 'n' drop school logo, or click to select"
                    error={error?.message}
                  />
                )}
              />
            </div>
            <Button type="submit">Next</Button>
          </form>
        )}

        {/* Step 2: Configure Classes/Boards/Books */}
        {currentStep === 1 && (
          <form onSubmit={classBookConfigForm.handleSubmit(() => handleNext(classBookConfigForm))} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Configure Classes & Books</h2>
            {classFields.map((classItem, classIndex) => (
              <div key={classItem.id} className="border p-4 rounded-md bg-gray-50 space-y-4 relative">
                <h3 className="text-lg font-medium">Class #{classIndex + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`classes.${classIndex}.class.name`}>Class Name</Label>
                    <Input
                      id={`classes.${classIndex}.class.name`}
                      {...classBookConfigForm.register(`classes.${classIndex}.class.name`)}
                    />
                    {classBookConfigForm.formState.errors.classes?.[classIndex]?.class?.name && (
                      <p className="text-red-500 text-sm mt-1">{classBookConfigForm.formState.errors.classes[classIndex].class.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`classes.${classIndex}.class.grade`}>Grade</Label>
                    <Input
                      id={`classes.${classIndex}.class.grade`}
                      type="number"
                      {...classBookConfigForm.register(`classes.${classIndex}.class.grade`, { valueAsNumber: true })}
                    />
                    {classBookConfigForm.formState.errors.classes?.[classIndex]?.class?.grade && (
                      <p className="text-red-500 text-sm mt-1">{classBookConfigForm.formState.errors.classes[classIndex].class.grade.message}</p>
                    )}
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <Label htmlFor={`classes.${classIndex}.class.syllabus`}>Syllabus Description</Label>
                    <Textarea
                      id={`classes.${classIndex}.class.syllabus`}
                      {...classBookConfigForm.register(`classes.${classIndex}.class.syllabus`)}
                    />
                    {classBookConfigForm.formState.errors.classes?.[classIndex]?.class?.syllabus && (
                      <p className="text-red-500 text-sm mt-1">{classBookConfigForm.formState.errors.classes[classIndex].class.syllabus.message}</p>
                    )}
                  </div>
                </div>

                <h4 className="font-medium mt-4">Books for this Class</h4>
                {classBookConfigForm.watch(`classes.${classIndex}.books`)?.map((bookItem, bookIndex) => (
                  <div key={bookItem.id || bookIndex} className="flex gap-2 items-end">
                    <div className="flex-grow">
                      <Label htmlFor={`classes.${classIndex}.books.${bookIndex}.title`}>Book Title</Label>
                      <Input
                        id={`classes.${classIndex}.books.${bookIndex}.title`}
                        {...classBookConfigForm.register(`classes.${classIndex}.books.${bookIndex}.title`)}
                      />
                      {classBookConfigForm.formState.errors.classes?.[classIndex]?.books?.[bookIndex]?.title && (
                        <p className="text-red-500 text-sm mt-1">{classBookConfigForm.formState.errors.classes[classIndex].books[bookIndex].title.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`classes.${classIndex}.books.${bookIndex}.isbn`}>ISBN (Optional)</Label>
                      <Input
                        id={`classes.${classIndex}.books.${bookIndex}.isbn`}
                        {...classBookConfigForm.register(`classes.${classIndex}.books.${bookIndex}.isbn`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`classes.${classIndex}.books.${bookIndex}.barcode`}>Barcode</Label>
                      <Input
                        id={`classes.${classIndex}.books.${bookIndex}.barcode`}
                        {...classBookConfigForm.register(`classes.${classIndex}.books.${bookIndex}.barcode`)}
                      />
                      {classBookConfigForm.formState.errors.classes?.[classIndex]?.books?.[bookIndex]?.barcode && (
                        <p className="text-red-500 text-sm mt-1">{classBookConfigForm.formState.errors.classes[classIndex].books[bookIndex].barcode.message}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const currentBooks = classBookConfigForm.getValues(`classes.${classIndex}.books`);
                        if (currentBooks.length > 1) {
                            classBookConfigForm.setValue(`classes.${classIndex}.books`, currentBooks.filter((_, i) => i !== bookIndex));
                        } else {
                            toast({
                                title: "Cannot remove",
                                description: "A class must have at least one book.",
                                variant: "destructive",
                            });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => {
                    const currentBooks = classBookConfigForm.getValues(`classes.${classIndex}.books`);
                    classBookConfigForm.setValue(`classes.${classIndex}.books`, [...currentBooks, { title: '', isbn: '', barcode: '' }]);
                  }}
                  className="mt-2"
                  variant="outline"
                >
                  Add Another Book
                </Button>
                {classFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeClass(classIndex)}
                    className="absolute top-4 right-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={() => appendClass({ class: { name: '', grade: '', syllabus: '' }, books: [{ title: '', isbn: '', barcode: '' }] })}
              className="mt-4 w-full"
              variant="outline"
            >
              Add Another Class
            </Button>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                Previous
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        )}

        {/* Step 3: Provision Principal */}
        {currentStep === 2 && (
          <form onSubmit={principalDetailsForm.handleSubmit(() => handleNext(principalDetailsForm))} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Principal Information</h2>
            <div>
              <Label htmlFor="principalName">Name</Label>
              <Input id="principalName" {...principalDetailsForm.register('name')} />
              {principalDetailsForm.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{principalDetailsForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="principalEmail">Email</Label>
              <Input id="principalEmail" type="email" {...principalDetailsForm.register('email')} />
              {principalDetailsForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{principalDetailsForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="principalPhone">Phone (Optional)</Label>
              <Input id="principalPhone" type="tel" {...principalDetailsForm.register('phone')} />
              {principalDetailsForm.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{principalDetailsForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                Previous
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        )}

        {/* Step 4: Assign Teachers */}
        {currentStep === 3 && (
          <form onSubmit={teachersForm.handleSubmit(() => handleNext(teachersForm))} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Assign Teachers</h2>
            {teacherFields.map((teacherItem, teacherIndex) => (
              <div key={teacherItem.id} className="border p-4 rounded-md bg-gray-50 space-y-4 relative">
                <h3 className="text-lg font-medium">Teacher #{teacherIndex + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`teachers.${teacherIndex}.name`}>Teacher Name</Label>
                    <Input
                      id={`teachers.${teacherIndex}.name`}
                      {...teachersForm.register(`teachers.${teacherIndex}.name`)}
                    />
                    {teachersForm.formState.errors.teachers?.[teacherIndex]?.name && (
                      <p className="text-red-500 text-sm mt-1">{teachersForm.formState.errors.teachers[teacherIndex].name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`teachers.${teacherIndex}.email`}>Email</Label>
                    <Input
                      id={`teachers.${teacherIndex}.email`}
                      type="email"
                      {...teachersForm.register(`teachers.${teacherIndex}.email`)}
                    />
                    {teachersForm.formState.errors.teachers?.[teacherIndex]?.email && (
                      <p className="text-red-500 text-sm mt-1">{teachersForm.formState.errors.teachers[teacherIndex].email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`teachers.${teacherIndex}.subject`}>Subject</Label>
                    <Input
                      id={`teachers.${teacherIndex}.subject`}
                      {...teachersForm.register(`teachers.${teacherIndex}.subject`)}
                    />
                    {teachersForm.formState.errors.teachers?.[teacherIndex]?.subject && (
                      <p className="text-red-500 text-sm mt-1">{teachersForm.formState.errors.teachers[teacherIndex].subject.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`teachers.${teacherIndex}.classIds`}>Assigned Classes</Label>
                    {/* Simplified Multi-Select for Class IDs */}
                    <Controller
                      control={teachersForm.control}
                      name={`teachers.${teacherIndex}.classIds`}
                      render={({ field }) => (
                        <select
                          {...field}
                          multiple
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                            field.onChange(selectedOptions);
                          }}
                        >
                          {availableClassesForTeachers.map((classOption) => (
                            <option key={classOption.value} value={classOption.value}>
                              {classOption.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {teachersForm.formState.errors.teachers?.[teacherIndex]?.classIds && (
                      <p className="text-red-500 text-sm mt-1">{teachersForm.formState.errors.teachers[teacherIndex].classIds.message}</p>
                    )}
                  </div>
                </div>
                {teacherFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTeacher(teacherIndex)}
                    className="absolute top-4 right-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={() => appendTeacher({ name: '', email: '', subject: '', classIds: [] })}
              className="mt-4 w-full"
              variant="outline"
            >
              Add Another Teacher
            </Button>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                Previous
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        )}

        {/* Step 5: Upload Initial Content */}
        {currentStep === 4 && (
          <form onSubmit={initialContentForm.handleSubmit(() => handleNext(initialContentForm))} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Upload Initial Content</h2>
            <div>
              <Controller
                control={initialContentForm.control}
                name="file"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <FileUpload
                    id="initialContentFile"
                    label="Initial Content (ZIP or other content package)"
                    value={value}
                    onChange={(file) => {
                      onChange(file);
                      initialContentForm.setValue('fileName', file ? file.name : '');
                      initialContentForm.setValue('fileSize', file ? file.size : 0);
                    }}
                    accept=".zip,.rar,.tar"
                    placeholder="Drag 'n' drop content package, or click to select"
                    error={error?.message}
                  />
                )}
              />
              {initialContentForm.formState.errors.file && (
                <p className="text-red-500 text-sm mt-1">{initialContentForm.formState.errors.file.message}</p>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                Previous
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        )}

        {/* Step 6: Review & Create */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Review & Create School</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-blue-50">
                <h3 className="text-lg font-bold text-blue-800 mb-2">School Details</h3>
                <p><strong>Name:</strong> {onboardingData.schoolDetails?.name}</p>
                <p><strong>Address:</strong> {onboardingData.schoolDetails?.address}</p>
                <p><strong>Board:</strong> {onboardingData.schoolDetails?.board}</p>
                {onboardingData.schoolDetails?.logoUrl && <p><strong>Logo:</strong> {onboardingData.schoolDetails.logoUrl.name || onboardingData.schoolDetails.logoUrl}</p>}
              </div>

              <div className="p-4 border rounded-md bg-green-50">
                <h3 className="text-lg font-bold text-green-800 mb-2">Classes & Books</h3>
                {onboardingData.classBookConfig.map((cb, index) => (
                  <div key={index} className="mb-3 border-b pb-2 last:border-b-0 last:pb-0">
                    <p className="font-semibold">Class {index + 1}: {cb.class.name} (Grade {cb.class.grade})</p>
                    <p className="ml-4">Syllabus: {cb.class.syllabus}</p>
                    <p className="ml-4 font-medium">Books:</p>
                    <ul className="list-disc list-inside ml-8">
                      {cb.books.map((book, bIndex) => (
                        <li key={bIndex}>{book.title} (Barcode: {book.barcode}) {book.isbn ? `(ISBN: ${book.isbn})` : ''}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-4 border rounded-md bg-yellow-50">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Principal Details</h3>
                <p><strong>Name:</strong> {onboardingData.principalDetails?.name}</p>
                <p><strong>Email:</strong> {onboardingData.principalDetails?.email}</p>
                <p><strong>Phone:</strong> {onboardingData.principalDetails?.phone || 'N/A'}</p>
              </div>

              <div className="p-4 border rounded-md bg-purple-50">
                <h3 className="text-lg font-bold text-purple-800 mb-2">Assigned Teachers</h3>
                {onboardingData.teachers.map((teacher, index) => (
                  <div key={index} className="mb-3 border-b pb-2 last:border-b-0 last:pb-0">
                    <p className="font-semibold">Teacher {index + 1}: {teacher.name}</p>
                    <p className="ml-4">Email: {teacher.email}</p>
                    <p className="ml-4">Subject: {teacher.subject}</p>
                    <p className="ml-4">Classes: {teacher.classIds.map(id => availableClassesForTeachers.find(c => c.value === id)?.label || id).join(', ')}</p>
                  </div>
                ))}
              </div>

              {onboardingData.initialContent?.file && (
                <div className="p-4 border rounded-md bg-red-50">
                  <h3 className="text-lg font-bold text-red-800 mb-2">Initial Content</h3>
                  <p><strong>File Name:</strong> {onboardingData.initialContent.file.name}</p>
                  <p><strong>File Size:</strong> {(onboardingData.initialContent.file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create School
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl font-bold">School Onboarded Successfully!</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              The school has been created and principal credentials provisioned.
              <br />
              School ID: <span className="font-semibold">{newSchoolId}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={handleGoToPrincipalDashboard} className="bg-indigo-600 hover:bg-indigo-700">
              Go to Principal Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolOnboardingPage;