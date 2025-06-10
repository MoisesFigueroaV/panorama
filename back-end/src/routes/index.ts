import { Router } from 'express'
import authRoutes from './auth'
import userRoutes from './users'
import eventRoutes from './events'
import organizerRoutes from './organizadores'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', userRoutes)
router.use('/eventos', eventRoutes)
router.use('/organizadores', organizerRoutes)

export default router 